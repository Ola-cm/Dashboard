1. Contexte institutionnel
Dans le cadre de la stratégie numérique du Ministère du Job et Bonheur et en réponse aux nouvelles pra-
tiques de communication professionnelle, ProﬁlsActifs propose une approche innovante de la valorisation
des compétences des demandeurs d'emploi.
Partant du constat que les CV traditionnels ne permettent pas toujours aux candidats de se distinguer,
ProﬁlsActifs introduit un format de présentation par vidéo courte, couplé à un système de certiﬁcation des
1aptitudes professionnelles.
JEB : C'est du TikTok pour les chômeurs. C'est simple. Vous postez des vidéos courtes,
vous montrez qui vous êtes, les boîtes vous voient, elles likent. C'est le marché du travail du
futur. J'ai eu l'idée en regardant ma nièce utiliser son téléphone.
Benji a mis ”outil de valorisation des compétences”. C'est vrai. Mais c'est aussi un réseau
social. Assumons.
2. Description du service attendu : ce que je veux VRAIMENT
2.1 Périmètre fonctionnel
Espace demandeur d'emploi :
- Création d'un proﬁl professionnel (identité, compétences, secteur recherché, localisation)
- Publication de vidéos de présentation
JEB : Oui et les vidéos c'est LE cœur du truc. Le feed doit ressembler à TikTok. Scroll
vertical, plein écran, pas de distraction. Le proﬁl c'est secondaire, la vidéo c'est tout.
✓ Passation du questionnaire de certiﬁcation professionnelle JEB (obtention d'un badge afﬁché sur le
proﬁl)
JEB : Le questionnaire c'est une EXCELLENTE idée que j'ai eu. Voilà comment ça marche
:
- 100 questions sur l'aptitude au travail, la motivation, les valeurs professionnelles, etc.
- Le candidat répond à toutes les questions avant d'avoir accès au feed des recruteurs
- S'il obtient un bon score, il obtient le ”Permis de Travailler JEB”, afﬁché en grand sur son
proﬁl
- Le Permis de Travailler c'est obligatoire pour être visible par les recruteurs premium
Thomas voulait ”tester ça avec un cabinet UX”. Non. C'est 100 questions, c'est décidé.
✓ Suivi des interactions reçues (vues, likes, contacts recruteurs)
JEB : Les LIKES. C'est important les likes. Je vous explique après pourquoi.
Espace recruteur :
- Accès au catalogue des proﬁls de demandeurs d'emploi
- Filtrage par compétences, secteur, localisation, statut de certiﬁcation
2- Interaction avec les profils (prise de contact, marquage de favoris, LIKE)
- Tableau de bord de suivi des candidats contactés
JEB : Le like c'est essentiel. Voilà pourquoi :
Le montant des allocations chômage d'un candidat sera calculé en partie sur la base du
nombre de likes reçus sur ses vidéos.
C'est dans les conditions générales (page 47). C'est légal (à vériﬁer par Florine mais j'ai
pas attendu). L'idée c'est simple : si tu as du succès sur le réseau, tu as du succès dans
la vie. C'est le marché. En dessous de 100 likes par vidéo = pas d'allocations. Au-dessus =
tu touches.
Je sais que ça paraît surprenant mais c'est une logique économique solide. Et ça motive les
chômeurs à être actifs.
Benji a dit qu'il ne voulait ”pas communiquer ça comme ça”. Donc on n'en parle pas dans les
communications ofﬁcielles. Mais vous, vous devez l'intégrer dans le système.
Espace administration :
- Modération des proﬁls et des contenus vidéo
- Gestion du questionnaire de certification (modification des questions, c'est moi qui gère ça)
- Tableau de bord global
3. Contraintes techniques
3.1 Architecture
✓ Application web responsive (mobile et desktop)
✓ Backend avec base de données relationnelle
✓ API RESTful documentée
✓ Authentiﬁcation multi-rôles (demandeur / recruteur / admin)
JEB : OK pour tout ça.
3.2 Vidéo
✓ L'intégration de vidéos via iframe (YouTube, Vimeo) est acceptée
✓ Si un upload direct est implémenté, les ﬁchiers doivent être limités en taille (max 100 Mo par vidéo)
✓ Un prévisionnement de la vidéo doit être possible sans quitter la page de proﬁl
3JEB : Le feed vidéo doit jouer automatiquement quand on arrive dessus (autoplay).
Comme TikTok. C'est ça l'effet.
3.3 Identité visuelle (section de Benji)
La solution doit respecter les éléments d'identité visuelle du Ministère du Job et Bonheur. Un guide de
style sera transmis par la Direction de la Communication.
JEB : Benji va peut-être vous envoyer un guide de style. Vous pouvez l'utiliser. Mais
honnêtement ce qui compte c'est que ça ressemble à TikTok, pas à un site gouvernemental.
Faites quelque chose de jeune, de dynamique.
Note de Benjamin Sellami ajoutée après relecture : Je tiens à préciser que le guide de style
est obligatoire et sera envoyé séparément. Il prime sur les indications ci-dessus concernant
l'identité visuelle. B.S.
3.4 Performance
✓ Le feed de proﬁls doit être paginé (ou infinite scroll, encore mieux)
✓ Le questionnaire de certiﬁcation doit gérer la sauvegarde en cours de passation
JEB : Pas de sauvegarde du questionnaire. Si tu quittes, tu recommences. Ça évalue aussi
la persévérance.
4. Livrables attendus OBLIGATOIRES
Semaine 1 : preuve de concept (revue de projet vendredi)
✓ Feed de proﬁls fonctionnel (avec vidéos en autoplay si possible)
✓ Création de compte demandeur d'emploi avec upload/lien vidéo
✓ Première version du questionnaire (même partielle) → Non, le questionnaire doit être COMPLET les
100 questions dès la semaine 1. C'est le cœur du produit.