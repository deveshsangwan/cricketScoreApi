export const cricbuzzLiveScoresHtml = `
<html>
  <body>
    <a
      href="/live-cricket-scores/153737/aus-vs-ban-2nd-odi-old-slug"
      title="Australia vs Bangladesh, 2nd ODI - AUS opt to bat "
    >AUS vs BAN - AUS opt to bat</a>
    <a
      href="/live-cricket-scores/153737/aus-vs-ban-2nd-odi-new-slug"
      title="Australia vs Bangladesh, 2nd ODI - Live "
    >Australia vs Bangladesh LIVE 2nd ODI</a>
    <a
      href="/live-cricket-scores/156124/inda-vs-afga-2nd-match"
      title="India A vs Afghanistan A, 2nd Match - AFGA opt to bowl "
    >India A vs Afghanistan A 2nd Match</a>
  </body>
</html>`;

export const cricbuzzNoMatchesHtml = `
<html>
  <body>
    <a href="/cricket-news">News</a>
    <a href="/live-cricket-scorecard/153737/scorecard-only">Scorecard</a>
  </body>
</html>`;

export const cricbuzzInProgressCommentary = {
    matchCommentary: {
        '1781154373977': {
            matchId: 153737,
            commType: 'commentary',
            commText:
                'Mustafizur Rahman to Cooper Connolly, <b>out</b> Caught by Litton Das!!',
            ballMetric: 1.1,
            timestamp: 1781154373977,
        },
        '1781154275330': {
            matchId: 153737,
            commType: 'commentary',
            commText: 'Taskin Ahmed to Josh Inglis, no run',
            ballMetric: 0.6,
            timestamp: 1781154275330,
        },
    },
    miniscore: {
        batTeam: {
            teamId: 4,
            teamScore: 0,
            teamWkts: 2,
        },
        batsmanStriker: {
            name: 'Josh Inglis',
            runs: 0,
            balls: 2,
        },
        batsmanNonStriker: {
            name: 'Matt Renshaw',
            runs: 0,
            balls: 0,
        },
        currentRunRate: 0,
        requiredRunRate: 0,
        partnerShip: {
            runs: 0,
            balls: 3,
        },
        lastWicket: 'Cooper Connolly c Litton Das b Mustafizur Rahman 0(1)',
        recentOvsStats: 'W',
        status: 'Australia opt to bat',
        matchScoreDetails: {
            matchId: 153737,
            inningsScoreList: [
                {
                    inningsId: 1,
                    batTeamId: 4,
                    batTeamName: 'AUS',
                    score: 0,
                    wickets: 2,
                    overs: 1.1,
                },
            ],
            state: 'In Progress',
            customStatus: 'Australia opt to bat',
        },
    },
    matchHeader: {
        matchId: 153737,
        matchFormat: 'ODI',
        state: 'In Progress',
        status: 'Australia opt to bat',
        seriesName: 'Australia tour of Bangladesh, 2026',
        tossResults: {
            tossWinnerName: 'Australia',
            decision: 'Batting',
        },
        team1: {
            id: 6,
            name: 'Bangladesh',
            shortName: 'BAN',
        },
        team2: {
            id: 4,
            name: 'Australia',
            shortName: 'AUS',
        },
        matchTeamInfo: [
            {
                battingTeamId: 4,
                battingTeamShortName: 'AUS',
                bowlingTeamId: 6,
                bowlingTeamShortName: 'BAN',
            },
        ],
    },
};

export const cricbuzzCompletedCommentary = {
    matchCommentary: {
        '1781131607399': {
            commType: 'commentary',
            commText: '<b>Canada won by 2 wkts</b>',
            timestamp: 1781131607399,
        },
    },
    matchHeader: {
        matchId: 159932,
        matchFormat: 'ODI',
        state: 'Complete',
        status: 'Canada won by 2 wkts',
        seriesName: 'ICC Cricket World Cup League Two 2023-27',
        team1: {
            id: 24,
            name: 'Netherlands',
            shortName: 'NED',
        },
        team2: {
            id: 26,
            name: 'Canada',
            shortName: 'CAN',
        },
    },
};

export const cricbuzzCompletedScorecard = {
    scoreCard: [
        {
            inningsId: 1,
            batTeamDetails: {
                batTeamId: 24,
                batTeamName: 'Netherlands',
                batTeamShortName: 'NED',
            },
            scoreDetails: {
                runs: 214,
                wickets: 10,
                overs: 47.6,
            },
        },
        {
            inningsId: 2,
            batTeamDetails: {
                batTeamId: 26,
                batTeamName: 'Canada',
                batTeamShortName: 'CAN',
            },
            scoreDetails: {
                runs: 218,
                wickets: 8,
                overs: 49.5,
            },
        },
    ],
    matchHeader: cricbuzzCompletedCommentary.matchHeader,
    status: 'Canada won by 2 wkts',
    isMatchComplete: true,
};

export const cricbuzzPreviewCommentary = {
    matchCommentary: {},
    matchHeader: {
        matchId: 156905,
        matchFormat: 'T20',
        state: 'Preview',
        status: 'Match starts at Jun 11, 08:30 GMT',
        seriesName: 'T20 Mumbai 2026',
        team1: {
            id: 585,
            name: 'ARCS Andheri',
            shortName: 'AA',
        },
        team2: {
            id: 578,
            name: 'Aakash Tigers MWS',
            shortName: 'ATMWS',
        },
    },
};

export const cricbuzzPreviewScorecard = {
    scoreCard: [],
    matchHeader: cricbuzzPreviewCommentary.matchHeader,
    status: 'Match starts at Jun 11, 08:30 GMT',
    isMatchComplete: false,
};
