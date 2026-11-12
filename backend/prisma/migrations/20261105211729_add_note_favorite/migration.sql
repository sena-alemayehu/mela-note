-- AlterTable
ALTER TABLE `Note`
ADD COLUMN `isFavorite` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Note_userId_isFavorite_idx`
ON `Note`(`userId`, `isFavorite`);
