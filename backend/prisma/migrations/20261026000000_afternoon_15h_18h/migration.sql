-- Groupes de l'après-midi : 15h – 18h au lieu de 16h – 19h (seulement ceux pas encore modifiés).
UPDATE "InPersonSession" SET "startTime" = '15:00', "endTime" = '18:00', "updatedAt" = CURRENT_TIMESTAMP
WHERE "startTime" = '16:00' AND "endTime" = '19:00';
