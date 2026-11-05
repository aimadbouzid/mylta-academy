-- Nouveau prix : 15 000 DA. Les sessions gardent une copie du prix faite à leur
-- création : sans cette mise à jour, la page de réservation afficherait encore
-- l'ancien montant.
UPDATE "InPersonSession" SET price = 15000 WHERE price IN (18000, 22000);
