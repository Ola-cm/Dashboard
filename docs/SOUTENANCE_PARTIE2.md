# Partie 2 — Dashboard & Infrastructure — Guide de soutenance

Ce document est écrit pour être lu presque tel quel à l'oral. Chaque section raconte comment une
partie du système fonctionne, dans l'ordre logique : d'abord le contexte général, puis
l'authentification, puis le dashboard et son fonctionnement au quotidien, puis les mécanismes plus
transversaux (registre de services, OAuth, HTTP), et enfin le détail des 4 nouveaux services que
j'ai ajoutés. Une dernière section liste les questions que le jury pose le plus souvent sur ce
genre de projet, avec une réponse déjà prête.

---

## 0. Le périmètre dont je suis responsable

Le projet est coupé en deux parties. Ma binôme s'occupe de la "Partie 1 — Content & Widgets" :
elle choisit les services externes (météo, GitHub, YouTube, Spotify...), écrit la logique qui va
chercher les données chez eux, et construit les widgets qui les affichent. Moi je m'occupe de la
"Partie 2 — Dashboard & Infrastructure" : je suis responsable de tout ce qui fait fonctionner
l'application autour de ces widgets, indépendamment du contenu qu'ils affichent. Concrètement,
ça veut dire : le compte utilisateur (inscription, connexion), le tableau de bord lui-même
(ajouter un widget, le déplacer, le redimensionner, le supprimer, le reconfigurer), le système qui
rafraîchit automatiquement chaque widget à son propre rythme, la page de profil et de gestion des
services souscrits, la section d'administration des comptes, le fichier `/about.json` qui décrit
tout le catalogue, et enfin toute l'infrastructure : Docker, les tests automatisés, la CI/CD, la
documentation.

En cours de route, j'ai aussi ajouté quatre nouveaux services au catalogue général (Pinterest, un
service "site web" qui prend une capture d'écran de n'importe quelle URL, une horloge, et un
calendrier), ainsi que deux fonctionnalités demandées après coup : la possibilité de partager
publiquement son dashboard en lecture seule, et un système de thèmes visuels.

---

## 1. Comment le projet est organisé

Le projet est un monorepo : un seul dépôt Git qui contient deux applications séparées, `backend`
et `frontend`, plus un fichier `docker-compose.yml` unique à la racine qui les fait tourner
ensemble avec une base de données PostgreSQL et un faux serveur mail pour les tests (MailHog).

Le backend est une API Express classique, qui ne sert que du JSON — il n'a jamais de HTML à
rendre. Le frontend est une application React construite avec Vite, qui tourne entièrement dans
le navigateur et va chercher toutes ses données en interrogeant l'API du backend. Les deux
communiquent uniquement en HTTP, jamais autrement — ce qui veut dire qu'on pourrait remplacer le
frontend par une autre application (une app mobile, par exemple) sans toucher une ligne du
backend, tant qu'elle respecte le même contrat d'API.

Côté backend, le code est rangé en couches très strictes. Les fichiers dans `controllers/`
reçoivent une requête HTTP, et se contentent d'appeler une fonction dans `services/`, puis de
renvoyer sa réponse avec le bon code de statut. Toute la vraie logique — les règles métier, les
vérifications, l'accès à la base de données — vit dans `services/`. Cette séparation permet de
tester la logique métier directement, sans avoir à simuler une vraie requête HTTP à chaque fois,
et de tester les routes séparément pour vérifier que les bons codes HTTP sortent au bon moment.

---

## 2. Le parcours d'un compte : inscription, confirmation, connexion

Quand quelqu'un s'inscrit, le serveur vérifie d'abord que le mot de passe fait au moins huit
caractères et que l'email n'est pas déjà utilisé. Le mot de passe n'est jamais stocké tel quel :
il passe par un algorithme de hachage, `bcrypt`, qui transforme le mot de passe en une empreinte
impossible à inverser. Même si quelqu'un accédait à la base de données, il ne pourrait pas
retrouver le mot de passe original à partir de cette empreinte.

Le compte est créé avec un jeton de confirmation aléatoire, une longue chaîne générée de façon
cryptographiquement sûre, et un email est envoyé à l'utilisateur avec un lien contenant ce jeton.
Tant que le compte n'est pas confirmé, il est impossible de se connecter — c'est une vérification
faite explicitement à la connexion. Quand l'utilisateur clique sur le lien, le serveur retrouve le
compte correspondant à ce jeton, marque le compte comme confirmé, et surtout efface le jeton : il
ne peut donc servir qu'une seule fois.

Pour la connexion, le serveur vérifie l'email, compare le mot de passe fourni à l'empreinte
stockée, vérifie que le compte est bien confirmé, puis génère un token JWT. Ce token contient
juste l'identifiant de l'utilisateur et son rôle, signé avec une clé secrète que seul le serveur
connaît. Le frontend stocke ce token et le renvoie à chaque requête suivante dans l'en-tête
`Authorization`. Il n'y a donc aucune notion de session côté serveur : le serveur ne garde en
mémoire aucune trace de qui est connecté, il se contente de vérifier à chaque requête que le token
présenté est valide et n'a pas expiré. C'est ce qu'on appelle une authentification "stateless".

Un dernier détail important : le tout premier compte administrateur ne peut pas être créé depuis
l'application elle-même. Il faut lister son email dans une variable d'environnement avant même
l'inscription ; dès que ce compte s'inscrit, il devient automatiquement administrateur. C'est un
choix volontaire : il n'existe aucun mécanisme, nulle part dans le code, qui permette à un compte
de s'auto-promouvoir administrateur après coup.

---

## 3. Comment le frontend et le backend se parlent

Toutes les requêtes du frontend vers le backend passent par un seul point d'entrée : un client
HTTP configuré une fois pour toutes, qui ajoute automatiquement le token d'authentification à
chaque requête sortante. Aucun composant de l'interface n'a besoin de savoir comment fonctionne
l'authentification ; il appelle simplement une fonction comme "récupère la liste des widgets", et
le token est injecté tout seul en arrière-plan.

Ce même client HTTP surveille aussi les réponses qui reviennent. Si une réponse a le code 401
("non autorisé"), ça veut dire que le token n'est plus valide — soit il a expiré, soit il n'existe
plus. Dans ce cas, le frontend supprime le token stocké et redirige automatiquement vers la page
de connexion, sans que chaque page ait à gérer ce cas individuellement.

Ce mécanisme a d'ailleurs révélé un bug intéressant en cours de projet. Un widget qui dépend d'un
service externe — par exemple un widget GitHub alors que le compte GitHub n'est pas encore lié —
renvoyait lui aussi un code 401 pour dire "je ne suis pas autorisé à accéder à ce compte GitHub".
Sauf que le frontend interprétait n'importe quel 401 comme "ta session a expiré", et déconnectait
l'utilisateur juste parce qu'il avait ajouté un widget mal configuré. La correction a été de
changer ce code, uniquement quand l'échec vient d'un service externe et non de notre propre
vérification d'authentification, pour utiliser le code 424 ("dépendance échouée"), qui existe
justement pour ce genre de situation. Le code 401 reste ainsi strictement réservé à un seul
usage : dire que le token de la personne connectée n'est plus valide.

---

## 4. Le tableau de bord au quotidien

Chaque widget affiché sur le dashboard d'un utilisateur correspond à une ligne dans la base de
données : quel service, quel widget de ce service, sa configuration (par exemple la ville pour un
widget météo), sa vitesse de rafraîchissement, sa taille, et sa position sur l'écran. Rien de tout
ça n'est stocké côté frontend de façon durable — à chaque chargement de la page, la liste complète
des widgets de l'utilisateur est récupérée depuis le serveur.

**Ajouter un widget** se fait via une fenêtre modale générique. L'utilisateur choisit d'abord un
service dans une liste, puis un widget de ce service, et un formulaire de configuration apparaît,
propre à ce widget précis. Cette fenêtre ne connaît à l'avance aucun service ni aucun widget en
particulier : elle se contente de lire le catalogue général (le même qui alimente `/about.json`)
et d'aller chercher dynamiquement le bon petit formulaire à afficher. Ça veut dire qu'ajouter un
nouveau service au projet n'oblige jamais à toucher à cette fenêtre.

**Déplacer un widget** utilise la fonctionnalité de glisser-déposer native du navigateur, sans
aucune bibliothèque externe. Quand l'utilisateur commence à faire glisser un widget, l'application
retient précisément où, à l'intérieur du widget, l'utilisateur a cliqué. Quand il relâche la
souris sur le tableau de bord, la nouvelle position est calculée en tenant compte de cet
endroit précis, pour que le widget ne "saute" pas sous le curseur. Cette nouvelle position est
immédiatement appliquée à l'écran, pour que ce soit fluide, puis envoyée au serveur en arrière-plan
pour être sauvegardée. Si jamais cette sauvegarde échouait, seul un message d'erreur s'affiche —
le widget reste là où l'utilisateur l'a déposé visuellement, plutôt que de revenir brutalement en
arrière.

**Redimensionner un widget** se fait par une petite poignée dans le coin inférieur droit de
chaque widget, plutôt que par un menu. Pendant qu'on la fait glisser, une taille d'aperçu
s'affiche en temps réel sans qu'aucune requête ne parte vers le serveur ; ce n'est qu'au moment où
l'utilisateur relâche la souris, et seulement si la taille a réellement changé, qu'une seule
requête est envoyée pour sauvegarder la nouvelle taille. Ça évite d'envoyer une requête à chaque
pixel de mouvement pendant qu'on redimensionne.

**Supprimer** et **reconfigurer** un widget repassent par cette même fenêtre modale ou par un
simple bouton, et dans tous les cas passent par le serveur, qui revérifie systématiquement que le
widget appartient bien à la personne connectée avant d'agir. Cette vérification d'appartenance
est faite à chaque opération, jamais supposée acquise — c'est une règle générale du projet : on ne
fait jamais confiance à ce qu'envoie le frontend sans le revérifier côté serveur, que ce soit pour
la configuration d'un widget, sa taille, ou sa vitesse de rafraîchissement.

---

## 5. Le Timer : comment chaque widget se rafraîchit tout seul

Le sujet du projet demande explicitement que chaque instance de widget communique sa propre
vitesse de rafraîchissement à un système de minuterie. Concrètement, chaque widget affiché à
l'écran fait tourner sa propre minuterie indépendante, complètement séparée de celle des autres
widgets. Si cinq widgets sont affichés, il y a cinq minuteries actives en même temps, chacune avec
son propre intervalle de temps, réglable individuellement par l'utilisateur.

Dès qu'un widget apparaît à l'écran, une première requête part immédiatement pour récupérer ses
données, sans attendre le premier intervalle de temps. Ensuite, la minuterie se déclenche
régulièrement, toutes les "refreshRate" secondes, et répète cette même requête. Si l'utilisateur
modifie la configuration du widget — par exemple change la ville d'un widget météo — la minuterie
redémarre immédiatement avec la nouvelle configuration, sans attendre le prochain déclenchement
normal, pour que le changement soit visible tout de suite. Et bien sûr, dès qu'un widget est
retiré de l'écran, sa minuterie est arrêtée proprement pour ne pas continuer à interroger le
serveur inutilement.

Chaque appel de cette minuterie suit toujours le même chemin côté serveur : on vérifie que le
widget appartient bien à l'utilisateur, on récupère si besoin les identifiants du service externe
concerné, puis on délègue la récupération des données au module responsable de ce service précis.
Le serveur ne fait jamais d'appel réseau interne entre ses propres composants pour ça — tout se
passe dans le même processus, ce qui rend l'ensemble rapide et simple à suivre.

Pour les widgets horloge et compte à rebours que j'ai ajoutés, ce système de minuterie classique
ne suffisait pas à lui seul : une minuterie qui interroge le serveur toutes les vingt ou trente
secondes minimum donnerait une horloge qui saute par à-coups au lieu de tourner. J'ai donc ajouté,
uniquement côté navigateur, un second mécanisme purement visuel qui fait avancer l'heure affichée
seconde par seconde entre deux vraies récupérations de données, en se basant sur le temps
réellement écoulé depuis la dernière réponse du serveur. Le serveur reste la seule source fiable
pour la conversion du fuseau horaire ; seul l'affichage entre deux rafraîchissements est estimé
côté client, exactement comme le ferait une vraie horloge qui continue de tourner entre deux
remises à l'heure.

---

## 6. Comment un nouveau service est ajouté au catalogue

C'est probablement le point d'architecture le plus important à savoir expliquer, parce que c'est
ce qui a rendu possible d'ajouter quatre nouveaux services sans jamais avoir à modifier en
profondeur du code déjà existant.

Il existe deux "registres" complètement séparés, un pour les métadonnées et un pour la vraie
logique. Le premier registre ne connaît que la description de chaque service : son nom, la liste
de ses widgets, et pour chaque widget, sa description et ses paramètres configurables. C'est
exactement ce registre qui est utilisé pour construire la réponse de `/about.json`. Il ne sait
absolument pas comment aller chercher une donnée réelle — il ne fait que décrire ce qui existe.

Le second registre, lui, ne connaît que la logique d'exécution : pour un service et un widget
donnés, quelle fonction appeler pour obtenir la vraie donnée. Quand la minuterie d'un widget se
déclenche, c'est ce second registre qui est utilisé, jamais le premier.

Du côté du frontend, il existe un troisième petit registre, qui associe chaque paire
service-widget à deux composants React : un composant d'affichage, purement visuel, qui reçoit la
donnée déjà récupérée et la met en forme, et un composant de configuration, qui affiche le petit
formulaire permettant de régler les paramètres de ce widget particulier. Ni l'un ni l'autre ne
fait jamais lui-même d'appel réseau — ils ne font que recevoir des données en entrée et les
afficher, ou recevoir une configuration et permettre de la modifier.

Résultat concret : ajouter un nouveau service revient à créer quelques nouveaux fichiers dans un
dossier dédié à ce service, et à ajouter une seule ligne dans chacun de ces trois registres. Aucun
fichier partagé entre tous les services n'a besoin d'être modifié en profondeur, ce qui limite
énormément le risque de casser un service existant en en ajoutant un nouveau.

---

## 7. S'abonner à un service, et le cas particulier de l'OAuth

Certains services ne demandent rien de particulier pour être utilisés — s'abonner revient juste à
enregistrer, côté serveur, que l'utilisateur a activé ce service. D'autres services, en revanche,
nécessitent que l'utilisateur autorise explicitement l'application à accéder à son compte sur un
site tiers : c'est le cas de GitHub, YouTube, Spotify, et désormais Pinterest. Ces services-là
passent obligatoirement par un mécanisme d'autorisation appelé OAuth2, et il est explicitement
interdit de s'y abonner par le chemin classique.

Le principe d'OAuth2, expliqué simplement : plutôt que l'utilisateur donne son mot de passe
GitHub (ou Pinterest) directement à notre application, il est redirigé vers le site du service
concerné, se connecte là-bas, et autorise explicitement notre application à accéder à certaines
informations précises de son compte. Le site tiers redirige ensuite l'utilisateur vers notre
application avec un code temporaire, que notre serveur échange contre un véritable jeton d'accès,
sans jamais voir ni stocker le mot de passe original.

Pour éviter qu'un site malveillant ne puisse rediriger quelqu'un vers cette étape finale en se
faisant passer pour un autre utilisateur, l'application génère, au tout début du processus, un
jeton signé qui encode l'identité de l'utilisateur qui a lancé la demande. Ce jeton fait l'aller-
retour jusqu'au site tiers et revient avec la réponse ; le serveur le revérifie avant d'associer
le nouveau compte lié à la bonne personne.

Une fois l'accès obtenu, les identifiants ne sont jamais stockés en clair dans la base de
données : ils sont chiffrés avant d'être sauvegardés, et déchiffrés uniquement au moment précis où
ils sont nécessaires pour contacter le service externe. Si le jeton d'accès a une date
d'expiration et qu'il est expiré au moment où on en a besoin, le serveur va automatiquement le
renouveler en utilisant un second jeton prévu pour ça, sans jamais demander à l'utilisateur de se
reconnecter manuellement à ce service.

Le point remarquable ici, c'est que le contrôleur qui gère tout ce processus ne connaît jamais les
détails propres à un service en particulier : il s'appuie sur le fait que chaque module OAuth,
quel que soit le service, expose exactement les mêmes quatre fonctions avec le même comportement
attendu. Ajouter Pinterest à ce mécanisme n'a donc nécessité aucune modification de la logique
générale d'autorisation — seulement l'ajout d'un nouveau module suivant ce même contrat.

---

## 8. La page de profil et la section d'administration

La page de profil affiche les informations du compte connecté et propose la fonctionnalité de
partage public du dashboard, détaillée plus bas — c'est la partie que j'ai construite. Ma binôme
a complété cette même page depuis avec deux blocs supplémentaires : la modification du nom, de
l'email et du mot de passe (avec re-confirmation par email si l'adresse change), et la suppression
définitive du compte (protégée par la ressaisie du mot de passe). Si le jury pose une question
précise sur ces deux blocs-là, c'est elle qu'il faut orienter dessus — je peux expliquer qu'ils
existent et comment ils s'articulent avec le reste de la page, mais pas leur détail d'implémentation.

La page des services liste tout le catalogue, avec pour chaque service son statut réel pour
l'utilisateur connecté : disponible tout de suite, déjà souscrit, ou nécessitant de lancer le
processus d'autorisation.

La section d'administration n'est accessible qu'aux comptes ayant le rôle administrateur. Elle
permet de lister tous les comptes de la plateforme, de changer le rôle d'un utilisateur, ou de
supprimer un compte. Deux garde-fous existent volontairement : un administrateur ne peut ni
changer son propre rôle, ni supprimer son propre compte. Sans cette règle, il serait possible
qu'un administrateur se rétrograde par erreur et que plus personne ne puisse ensuite redonner ce
rôle à qui que ce soit, puisque rien dans l'application ne permet de promouvoir un compte après
coup.

---

## 9. Le fichier `/about.json`

Ce fichier, exigé explicitement par le sujet, décrit à la fois des informations sur le client qui
fait la requête et la liste complète des services et widgets disponibles sur le serveur, avec
pour chacun ses paramètres exacts. Il est servi à la racine du serveur, en dehors du préfixe
utilisé par le reste de l'API, et ne nécessite aucune authentification pour être consulté. Il
reflète toujours exactement ce qui est enregistré dans le premier registre décrit plus haut —
jamais une liste écrite en dur quelque part, ce qui garantit qu'il reste automatiquement à jour
dès qu'un nouveau service est ajouté.

**Point à connaître, ajouté par ma binôme** : `/about.json` ne montre désormais que les services
qui ont au moins 3 widgets — un service avec seulement 1 ou 2 widgets n'est pas considéré comme
un vrai service à part entière pour cette liste publique précise. Ça ne le désactive pas ailleurs
dans l'app (il reste utilisable normalement sur la page Services et sur le dashboard), il est
juste absent de ce fichier-là. **Conséquence concrète** : mon service `notes` (2 widgets :
`sticky_note` et `checklist`) est filtré et n'apparaît pas si quelqu'un consulte `/about.json`
directement — à savoir si le jury regarde ce fichier en particulier. Au total le registre
interne contient 12 services et 40 widgets, mais `/about.json` n'en expose que 11 et 38.

---

## 10. Le partage public d'un dashboard

Cette fonctionnalité a été demandée après un point d'étape sur le projet. L'idée est de permettre
à quelqu'un qui n'a pas de compte de consulter le dashboard d'un utilisateur, en lecture seule,
via un simple lien.

Quand un utilisateur active le partage depuis sa page de profil, le serveur génère un jeton
imprévisible et le sauvegarde sur son compte. Ce jeton fait office de "clé" : n'importe qui
connaissant ce jeton précis peut consulter une version publique du dashboard, sans jamais se
connecter. Désactiver le partage efface simplement ce jeton, ce qui rend instantanément l'ancien
lien invalide.

La page publique récupère les vraies données de chaque widget, exactement de la même façon que le
ferait le propriétaire du compte connecté — elle passe par les mêmes mécanismes de récupération de
données décrits plus haut. La seule différence, c'est que l'identité de la personne qui consulte
n'est jamais vérifiée : c'est la possession du jeton dans le lien qui remplace la connexion. Un
soin particulier a été pris pour qu'un widget dont la récupération échoue — par exemple parce que
le compte externe associé n'est plus valide — n'empêche pas d'afficher les autres widgets de la
page : chaque widget est traité indépendamment, et son erreur éventuelle reste isolée à lui seul.

---

## 11. La relecture des codes de statut HTTP

Une passe complète a été faite sur tous les points d'entrée de l'API pour vérifier que chaque
réponse renvoie le code HTTP le plus juste sémantiquement, et pas seulement un code qui "marche".
Une création renvoie 201, une suppression sans contenu à retourner renvoie 204, une tentative
d'accéder à quelque chose qui n'appartient pas à l'utilisateur renvoie 404 plutôt que 403 — pour
ne pas révéler par la différence de code qu'une ressource existe chez quelqu'un d'autre. Le seul
vrai bug trouvé pendant cette relecture concernait les deux garde-fous de la section
administration décrits plus haut : ils renvoyaient 400, comme si la requête était mal formée,
alors qu'il s'agit en réalité d'un refus d'autorisation sur une action par ailleurs parfaitement
valide — ça a été corrigé en 403.

---

## 12. Le système de thèmes visuels

Chaque couleur utilisée dans l'application n'est jamais écrite en dur dans le code d'un
composant : elle est définie une seule fois comme variable, et cette variable est redéfinie
différemment selon le thème actif. Un composant qui affiche du texte en "brun foncé" ne sait
jamais s'il est actuellement dans le thème clair, sombre, ou l'un des deux thèmes ajoutés
récemment — il continue simplement d'utiliser la même classe, et c'est la valeur de la variable
qui change en arrière-plan. C'est ce qui a permis d'ajouter deux thèmes entièrement nouveaux sans
avoir à modifier un seul des nombreux fichiers de widgets déjà existants.

---

## 13. Les quatre nouveaux services ajoutés

Les quatre suivent tous exactement le même schéma décrit plus haut. Voici ce qui est spécifique à
chacun.

**Pinterest** est le seul des quatre à nécessiter un compte lié. Il suit exactement le même
mécanisme d'autorisation OAuth2 que GitHub, YouTube ou Spotify, simplement branché sur les
adresses propres à l'API de Pinterest. Deux widgets sont proposés : l'un affiche les dernières
épingles enregistrées sur un tableau donné, l'autre affiche les statistiques générales de ce
tableau — son nom, sa description, son nombre d'épingles et d'abonnés.

**L'horloge** ne fait aucun appel à un service externe : la donnée qu'elle affiche est simplement
l'heure du serveur, convertie dans le fuseau horaire demandé grâce à une fonctionnalité native de
JavaScript. Si le fuseau horaire fourni n'est pas reconnu, une erreur claire est renvoyée plutôt
que de silencieusement afficher l'heure UTC par défaut. Les deux widgets — affichage numérique et
cadran avec aiguilles — partagent exactement le même calcul côté serveur ; seule la façon de le
représenter change côté frontend. C'est aussi sur ce widget qu'a été ajouté le mécanisme de
rafraîchissement visuel en temps réel décrit plus haut, pour que les aiguilles tournent vraiment
au lieu de sauter d'une position à l'autre.

**Le calendrier** ne fait lui non plus aucun appel externe : ses deux widgets sont entièrement
calculés à partir des paramètres fournis. Le premier construit une grille représentant un mois
donné, avec la case du jour actuel mise en évidence si le mois affiché est bien le mois en cours.
Le second calcule le temps restant jusqu'à une date cible donnée, en jours, heures, minutes et
secondes, et ce calcul est recalculé en continu côté frontend pour que le compte à rebours défile
vraiment seconde par seconde, plutôt que de rester figé jusqu'au prochain rafraîchissement.

**Le service "site web"** est le plus particulier des quatre : le serveur ne fait strictement
aucun appel réseau lui-même. Il se contente de vérifier que l'adresse fournie est bien une URL
valide, de la compléter avec le préfixe `https://` si besoin, puis de construire l'adresse d'un
service externe gratuit spécialisé dans la capture d'écran de pages web. C'est le navigateur de la
personne qui consulte le widget qui va chercher directement cette image, sans jamais passer par
notre propre serveur. Ce choix évite d'avoir à héberger nous-mêmes un outil de rendu de pages web,
ce qui aurait été plus lourd à mettre en place et aurait posé de vraies questions de sécurité, vu
qu'on aurait dû faire naviguer notre propre serveur vers n'importe quelle adresse fournie par un
utilisateur.

---

## 14. L'infrastructure, les tests et l'intégration continue

Toute l'application démarre avec une seule commande, qui lance quatre conteneurs : la base de
données PostgreSQL, un faux serveur mail utilisé uniquement en développement pour intercepter les
emails de confirmation sans avoir besoin d'un vrai service d'envoi, puis le backend et le
frontend eux-mêmes. Un problème découvert et corrigé en cours de route : il manquait un fichier
qui indique à Docker quels dossiers ignorer lors de la construction des images, ce qui faisait que
chaque reconstruction envoyait l'intégralité du dépôt, y compris les dépendances déjà installées,
ce qui ralentissait énormément chaque build sans aucune raison valable.

Chaque fonctionnalité côté serveur est couverte par deux niveaux de tests automatisés : un test
qui vérifie directement la logique métier en isolant les appels à la base de données et aux
services externes, et un test qui vérifie le comportement complet d'un point d'entrée HTTP, du
début à la fin, y compris le bon code de statut renvoyé. L'ensemble représente aujourd'hui plus
d'une centaine de tests, qui doivent tous passer avant qu'une fonctionnalité soit considérée comme
terminée. Une intégration continue est également configurée pour lancer automatiquement ces
vérifications à chaque changement poussé sur le dépôt, même si son exécution réelle est
actuellement bloquée par une limite de quota au niveau de l'organisation, indépendante du code du
projet lui-même.

---

## 15. Questions que le jury pose souvent, et comment y répondre

**Pourquoi une authentification par jeton plutôt que par session classique ?** Parce que le
serveur n'a alors aucun état à conserver entre deux requêtes : chaque requête se suffit à
elle-même avec son propre jeton. Ça simplifie aussi tout le mécanisme d'autorisation externe, qui
n'a pas besoin de gérer une session de navigation classique.

**Pourquoi revalider une configuration côté serveur alors que le formulaire du frontend la valide
déjà ?** Parce que rien n'empêche quelqu'un d'envoyer une requête directement à l'API, en
contournant complètement le formulaire. Toute vérification qui compte réellement pour la sécurité
ou la cohérence des données doit donc exister côté serveur ; ce qui se passe côté frontend n'est
là que pour le confort immédiat de l'utilisateur.

**Que se passe-t-il si deux instances du même widget existent avec des configurations
différentes ?** Rien de spécial : chaque instance de widget est une ligne complètement
indépendante dans la base de données, avec sa propre configuration. Ni le registre de services ni
le système de minuterie n'ont jamais connaissance d'un widget "partagé" entre plusieurs
instances — chaque instance vit sa vie de façon totalement isolée.

**Pourquoi avoir changé un code 401 en 424 plutôt que de corriger le comportement du frontend ?**
Parce que le comportement du frontend était en réalité correct : un code 401 doit toujours vouloir
dire "ton authentification n'est plus valide". Le vrai problème venait du fait qu'un tout autre
type d'erreur, la dépendance à un service externe non disponible, utilisait par erreur ce même
code. La bonne correction était donc de redonner à chaque situation son code sémantiquement exact,
plutôt que de complexifier le frontend pour qu'il fasse une exception.

**Comment un widget nouvellement ajouté apparaît-il côté frontend sans qu'on ait besoin de
redémarrer quoi que ce soit ?** Il n'apparaît pas "à chaud" sans déploiement : le catalogue vient
du fichier `/about.json`, lu à chaque chargement de la page, mais ajouter réellement un nouveau
widget nécessite d'écrire son code des deux côtés et de redéployer l'application. Ce qui est
dynamique, en revanche, c'est que ce même code n'a jamais besoin de modifier les parties déjà
existantes du projet pour s'intégrer.
