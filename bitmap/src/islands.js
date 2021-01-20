const scanNeighbors = (bitmap, row, col, islandId) => {
    if (
        row >= 0 &&
        row < bitmap.length &&
        col >= 0 &&
        col < bitmap[0].length &&
        bitmap[row][col] == 1
    ) {
        bitmap[row][col] = islandId;

        // Up
        scanNeighbors(bitmap, row - 1, col - 1, islandId);
        scanNeighbors(bitmap, row - 1, col, islandId);
        scanNeighbors(bitmap, row - 1, col + 1, islandId);

        // Sides
        scanNeighbors(bitmap, row, col - 1, islandId);
        scanNeighbors(bitmap, row, col + 1, islandId);

        // Down
        scanNeighbors(bitmap, row + 1, col - 1, islandId);
        scanNeighbors(bitmap, row + 1, col, islandId);
        scanNeighbors(bitmap, row + 1, col + 1, islandId);
    }
}

const calcNoOfIslands = (bitmap) => {
    let islandCount = 0;
    for (let i = 0; i < bitmap.length; i++) {
        for (let j = 0; j < bitmap[i].length; j++) {
            if (bitmap[i][j] == 1) {
                islandCount++;
                scanNeighbors(bitmap, i, j, islandCount + 1);
            }
        }
    }
    return { islandCount, bitmap }
}

export {
    calcNoOfIslands
}