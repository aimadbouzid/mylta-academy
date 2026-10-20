-- Les séances du club passent du code à la base, pour que les organisateurs
-- puissent les modifier sans déploiement.
CREATE TABLE "ClubTraining" (
  "id" SERIAL NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "text" TEXT NOT NULL DEFAULT '',
  "date" TEXT NOT NULL DEFAULT '',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClubTraining_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClubTraining_slug_key" ON "ClubTraining"("slug");
CREATE INDEX "ClubTraining_active_position_idx" ON "ClubTraining"("active", "position");

-- Les trois formations déjà annoncées, avec les slugs des inscriptions existantes.
INSERT INTO "ClubTraining" ("slug","title","text","position","updatedAt") VALUES
 ('vibe-coding','Vibe Coding','Créer un site web, une landing page ou votre propre outil en dialoguant avec l''IA : les bases, la méthode et tout ce qu''il faut pour vous lancer sans savoir coder.',0,CURRENT_TIMESTAMP),
 ('partenariat','Partenariat & clients','Comment trouver ses clients et bâtir ses partenariats : mon parcours, étape par étape.',1,CURRENT_TIMESTAMP),
 ('smartphone','Filmer & monter au smartphone','Tourner, monter et publier une vidéo propre avec le téléphone que vous avez déjà.',2,CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Nature de l'événement.
ALTER TABLE "ClubEvent" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'open-day';
