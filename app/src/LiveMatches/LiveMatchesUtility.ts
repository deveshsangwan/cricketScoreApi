import * as mongo from '../../core/BaseModel';

export async function insertDataToLiveMatchesTable(matchesData: { [key: string]: { matchUrl: string, matchName: string } }) {
    const dataToInsert = Object.entries(matchesData).map(([key, value]) => ({
        _id: key,
        matchUrl: value.matchUrl,
        matchName: value.matchName
    }));

    await mongo.insertMany(dataToInsert, 'liveMatches');
}