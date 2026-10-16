-- Trois premières sessions de la formation présentielle (3 jours, chez Camden, Béjaïa).
-- Week-ends (vendredi/samedi) l'après-midi : les adultes ne travaillent pas, et les
-- cours d'enfants de l'école ont lieu le matin. Modifiables ou supprimables dans l'admin.
INSERT INTO "InPersonSession" ("title", "date", "startTime", "endTime", "city", "place", "capacity", "price", "isOpen", "updatedAt")
SELECT v.title, v.date, '14:30', '18:30', 'Béjaïa', 'Camden International Institute', 10, 13000, true, CURRENT_TIMESTAMP
FROM (VALUES
  ('3 jours : ven. 30 oct., sam. 31 oct. et dim. 1er nov. (jour férié)', '2026-10-30'),
  ('3 jours : ven. 20, sam. 21 et ven. 27 novembre', '2026-11-20'),
  ('3 jours : ven. 11, sam. 12 et ven. 18 décembre', '2026-12-11')
) AS v(title, date)
WHERE NOT EXISTS (SELECT 1 FROM "InPersonSession" s WHERE s.date = v.date);
