-- Quatre groupes en fin d'après-midi (16h – 19h), 3 jours consécutifs du dimanche au jeudi,
-- pour ceux qui travaillent le matin.
INSERT INTO "InPersonSession" ("title", "date", "startTime", "endTime", "city", "place", "capacity", "price", "isOpen", "updatedAt")
SELECT v.title, v.date, '16:00', '19:00', 'Béjaïa', 'Camden International Institute', 10, 13000, true, CURRENT_TIMESTAMP
FROM (VALUES
  ('Groupe 6 · 3 après-midi', '2026-10-20'),
  ('Groupe 7 · 3 après-midi', '2026-10-25'),
  ('Groupe 8 · 3 après-midi', '2026-11-03'),
  ('Groupe 9 · 3 après-midi', '2026-11-08')
) AS v(title, date)
WHERE NOT EXISTS (SELECT 1 FROM "InPersonSession" s WHERE s.date = v.date AND s."startTime" = '16:00');
