-- Variante du test A/B vue par la personne au moment de son inscription.
ALTER TABLE "InPersonRegistration" ADD COLUMN "abPrix" TEXT;
CREATE INDEX "InPersonRegistration_abPrix_idx" ON "InPersonRegistration"("abPrix");

-- Visites par variante : un compteur par jour, pas une ligne par visiteur.
CREATE TABLE "AbVisite" (
    "id" SERIAL NOT NULL,
    "test" TEXT NOT NULL,
    "variante" TEXT NOT NULL,
    "jour" TEXT NOT NULL,
    "vues" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AbVisite_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AbVisite_test_variante_jour_key" ON "AbVisite"("test", "variante", "jour");
