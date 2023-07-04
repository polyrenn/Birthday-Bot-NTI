//I'm feeling Lucky
const getColorScheme= (colorScheme) => {
    const diagonalColorArray = [
        {
            colorScheme: 'blue',
            foreground: '#CBE2EC',
            background: '#E1F6FF'
        },
        {
            colorScheme: 'timberwolf',
            foreground:  '#D1D1C9',
            background: '#FFFFEE'
        },
        {
            colorScheme: 'cream',
            foreground: '#E9F4B1',
            background: '#CACDB9'
        },
        {
            colorScheme: 'silver',
            foreground: '#DCD9D9',
            background: '#AAAAAA'
        },
        {
            colorScheme: 'floral-white',
            foreground: '#A8A6A6',
            background: '#FFF7ED'
        },
        {
            colorScheme: 'ivory',
            foreground: '#E9F4B1',
            background: '#FFFFEE'
        },
        {
            colorScheme: 'papaya-whip',
            foreground: '#DBD7D8',
            background: '#FFEBCD'
        }
    ];
    return diagonalColorArray.find((element) => element.colorScheme === colorScheme)
}
    
module.exports = getColorScheme;