export const testData = {
    matchId: 'nLSAYi2BckuKRVA8',
    liveEndpoint: '/live1',
    teamDataStandardCase: {
        inputString: 'CBD 74/3 (9.1)',
        expectedOutput: {
            "name": "CBD",
            "score": "74",
            "wickets": "3",
            "overs": "9.1"
        }
    },
    teamDataNoOvers: {
        inputString: 'CBD 74/3',
        expectedOutput: {
            "name": "CBD",
            "score": "74",
            "wickets": "3"
        }
    },
    teamDataNoWickets: {
        inputString: 'IND 436',
        expectedOutput: {
            "name": "IND",
            "score": "436",
            "wickets": "10"
        }
    },
    secondInningsInProgress: {
        inputString: 'ENG 246 & 316/6 (77)',
        expectedOutput: {
            "name": "ENG",
            "score": "316",
            "wickets": "6",
            "overs": "77",
            "previousInnings": {
                "score": "246",
                "wickets": "10"
            }
        }
    },
};