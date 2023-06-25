const defaultTheme = require('tailwindcss/defaultTheme')
function getColorWithOpacity(color) {
    return ({ opacityValue }) => {
        if (opacityValue === undefined) {
            return `rgb(var(${color}))`;
        }
        return `rgba(var(${color}), ${opacityValue})`;
    }
}
module.exports = {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    // darkMode: false,
    theme: {
        extend: {
            colors: {
                button: getColorWithOpacity('--color-button'), // for button
                head: getColorWithOpacity('--color-bg-head'),
                content: getColorWithOpacity('--color-bg-content'),
                success: getColorWithOpacity('--color-message-success'),
                waring: getColorWithOpacity('--color-message-waring'),
                error: getColorWithOpacity('--color-message-error'),
                'txt-grey': getColorWithOpacity('--text-color-grey')
            },
            width: {
                'over-scroll': 'calc(100% + 17px)',
                'less-scroll': 'calc(100% - 17px)'
            },
            height: {
                'screen-120': 'calc(100vh - 120px)',
                'screen-72': 'calc(100vh - 72px)',
            },
            zIndex: { max: 9999 }
        },
        fontFamily: {
            'pf-bold': 'PingFang SC-Bold, PingFang SC',
            'pf-med': 'PingFang SC-Medium, PingFang SC'
        },
        screens: {
            'ssm': { max: '640px' },
            ...defaultTheme.screens,
        }
    },
    variants: {
        extend: {},
    },
    plugins: [],
}