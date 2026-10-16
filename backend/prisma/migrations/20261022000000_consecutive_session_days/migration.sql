-- Une session = 3 jours consécutifs : les deux dernières sessions mélangeaient des vendredis
-- de semaines différentes. Seuls les titres encore inchangés sont corrigés.
UPDATE "InPersonSession" SET "title" = '3 jours : ven. 20, sam. 21 et dim. 22 novembre', "updatedAt" = CURRENT_TIMESTAMP
WHERE "date" = '2026-11-20' AND "title" = '3 jours : ven. 20, sam. 21 et ven. 27 novembre';
UPDATE "InPersonSession" SET "title" = '3 jours : ven. 11, sam. 12 et dim. 13 décembre', "updatedAt" = CURRENT_TIMESTAMP
WHERE "date" = '2026-12-11' AND "title" = '3 jours : ven. 11, sam. 12 et ven. 18 décembre';
