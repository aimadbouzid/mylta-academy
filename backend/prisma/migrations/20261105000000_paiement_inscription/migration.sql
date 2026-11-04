-- Acompte reçu : coché à la main depuis l'admin, après le paiement sur WhatsApp.
ALTER TABLE "InPersonRegistration" ADD COLUMN "payeLe" TIMESTAMP(3);
