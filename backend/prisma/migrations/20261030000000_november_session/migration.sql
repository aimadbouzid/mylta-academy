-- Session unique des 12, 13 et 14 novembre 2026, au tarif de 22 000 DA.
-- Les autres dates disparaissent du site : celles qui ont des inscrits sont
-- seulement fermées (on garde les inscriptions), les autres sont supprimées.
UPDATE "InPersonSession" AS s SET "isOpen" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE s."date" <> '2026-11-12'
  AND EXISTS (SELECT 1 FROM "InPersonRegistration" r WHERE r."sessionId" = s."id");

DELETE FROM "InPersonSession" AS s
WHERE s."date" <> '2026-11-12'
  AND NOT EXISTS (SELECT 1 FROM "InPersonRegistration" r WHERE r."sessionId" = s."id");

INSERT INTO "InPersonSession" ("title", "date", "startTime", "endTime", "city", "place", "capacity", "price", "isOpen", "updatedAt")
SELECT 'Session unique · 12, 13 et 14 novembre', '2026-11-12', '08:30', '12:30', 'Béjaïa', 'Camden International Institute', 10, 22000, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "InPersonSession" WHERE "date" = '2026-11-12');

UPDATE "InPersonSession" SET "price" = 22000, "isOpen" = true, "capacity" = 10, "updatedAt" = CURRENT_TIMESTAMP
WHERE "date" = '2026-11-12';
