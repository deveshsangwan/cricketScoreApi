/**
 * ts-to-zod configuration.
 *
 * @type {import("./src/config").TsToZodConfig}
 */
module.exports = [
    {
        name: "liveMatches",
        input: "app/src/types/liveMatches.d.ts",
        output: "app/src/schema/liveMatches.zod.ts",
    },
    {
        name: "matchStats",
        input: "app/src/types/matchStats.d.ts",
        output: "app/src/schema/matchStats.zod.ts",
    }
];