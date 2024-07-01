export function fuzzySearch(input: string, items: string[]): string[] {
    const lowercasedInput = input.toLowerCase();
    return items.filter(item => 
      item.toLowerCase().includes(lowercasedInput)
    ).sort((a, b) => 
      a.toLowerCase().indexOf(lowercasedInput) - b.toLowerCase().indexOf(lowercasedInput)
    );
  }