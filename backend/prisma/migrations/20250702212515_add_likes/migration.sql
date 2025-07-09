-- CreateTable
CREATE TABLE "_LikedRecipes" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_LikedRecipes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LikedRecipes_B_index" ON "_LikedRecipes"("B");

-- AddForeignKey
ALTER TABLE "_LikedRecipes" ADD CONSTRAINT "_LikedRecipes_A_fkey" FOREIGN KEY ("A") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LikedRecipes" ADD CONSTRAINT "_LikedRecipes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
