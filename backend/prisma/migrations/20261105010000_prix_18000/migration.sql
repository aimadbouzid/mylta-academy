-- Le prix passe de 22 000 à 18 000 DA. Les sessions déjà créées portent leur
-- propre prix, copié des réglages au moment de leur création : sans cette
-- mise à jour, la page de réservation continuerait d'afficher l'ancien.
UPDATE "InPersonSession" SET price = 18000 WHERE price = 22000;
