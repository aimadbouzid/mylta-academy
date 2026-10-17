-- Nouveau planning de Camden : salles libres du dimanche au jeudi, de 8h à 13h.
-- 1) Les anciennes sessions du week-end sont retirées (supprimées si personne n'y est
--    inscrit, sinon simplement fermées pour garder les inscriptions).
DELETE FROM "InPersonSession" s
WHERE s."date" IN ('2026-10-30', '2026-11-20', '2026-12-11')
  AND NOT EXISTS (SELECT 1 FROM "InPersonRegistration" r WHERE r."sessionId" = s."id");
UPDATE "InPersonSession" SET "isOpen" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE "date" IN ('2026-10-30', '2026-11-20', '2026-12-11');

-- 2) Cinq groupes de 3 matinées consécutives (8h30 – 12h30), en évitant le 1er novembre (férié).
INSERT INTO "InPersonSession" ("title", "date", "startTime", "endTime", "city", "place", "capacity", "price", "isOpen", "updatedAt")
SELECT v.title, v.date, '08:30', '12:30', 'Béjaïa', 'Camden International Institute', 10, 13000, true, CURRENT_TIMESTAMP
FROM (VALUES
  ('Groupe 1 · 3 matinées', '2026-10-20'),
  ('Groupe 2 · 3 matinées', '2026-10-25'),
  ('Groupe 3 · 3 matinées', '2026-11-03'),
  ('Groupe 4 · 3 matinées', '2026-11-08'),
  ('Groupe 5 · 3 matinées', '2026-11-17')
) AS v(title, date)
WHERE NOT EXISTS (SELECT 1 FROM "InPersonSession" s WHERE s.date = v.date);
