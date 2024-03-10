export const testData = {
    invalidMatchId: {
        id: undefined,
        expectedOutput: {
            status: false,
            message: 'Error fetching match stats',
            error: 'Invalid match id: undefined'
        }
    },
    nonExistentMatchId: {
        id: 'nCSAYi2BckuKRVA8',
        expectedOutput: {
            status: false,
            message: 'Error fetching match stats',
            error: 'No match found with id: nCSAYi2BckuKRVA8'
        }
    },
    teamDataStandardCase: {
        inputString: 'CBD 74/3 (9.1)',
        expectedOutput: {
            'name': 'CBD',
            'score': '74',
            'wickets': '3',
            'overs': '9.1'
        }
    },
    teamDataNoOvers: {
        inputString: 'CBD 74/3',
        expectedOutput: {
            'name': 'CBD',
            'score': '74',
            'wickets': '3'
        }
    },
    teamDataNoWickets: {
        inputString: 'IND 436',
        expectedOutput: {
            'name': 'IND',
            'score': '436',
            'wickets': '10'
        }
    },
    secondInningsInProgress: {
        inputString: 'ENG 246 & 316/6 (77)',
        expectedOutput: {
            'name': 'ENG',
            'score': '316',
            'wickets': '6',
            'overs': '77',
            'previousInnings': {
                'score': '246',
                'wickets': '10'
            }
        }
    },
    getTournamentNameErrorHandling: {
        input: {
            length: 0
        },
        expectedOutput: 'Error while fetching tournament name: No elements found with the selector .cb-col.cb-col-100.cb-bg-white'
    },
};