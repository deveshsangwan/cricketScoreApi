import { cricketTeamMapping, specialTeamCases } from '@/constants/cricketTeams';

// Helper function for fuzzy matching team names
export const findFuzzyMatch = (teamName: string): string | null => {
  const lowerTeamName = teamName.toLowerCase();

  // Check if team name contains any mapped team name
  for (const [key, value] of cricketTeamMapping.entries()) {
    const lowerKey = key.toLowerCase();
    if (lowerTeamName.includes(lowerKey) || lowerKey.includes(lowerTeamName)) {
      return value;
    }
  }

  // Check special cases for common variations
  return specialTeamCases.get(lowerTeamName) || null;
};

// Generate placeholder image with team initials
export const generatePlaceholder = (teamName: string): string => {
  const initials = teamName
    .split(/\s+/)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 3);

  // Using a more reliable placeholder service with better styling
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1e293b&color=ffffff&size=80&font-size=0.6&bold=true&format=png`;
};

// Enhanced flag URL generator with better fallback logic
export const getTeamFlag = (teamName: string): string => {
  if (!teamName) {
    return generatePlaceholder('TBD');
  }

  // Clean and normalize team name
  const cleanTeamName = teamName.trim();

  // Direct mapping lookup
  const countryCode = cricketTeamMapping.get(cleanTeamName);

  if (countryCode) {
    return `https://flagcdn.com/w80/${countryCode}.png`;
  }

  // Fuzzy matching for partial names or different formats
  const fuzzyMatch = findFuzzyMatch(cleanTeamName);
  if (fuzzyMatch) {
    return `https://flagcdn.com/w80/${fuzzyMatch}.png`;
  }

  // Generate placeholder for unknown teams
  return generatePlaceholder(cleanTeamName);
}; 