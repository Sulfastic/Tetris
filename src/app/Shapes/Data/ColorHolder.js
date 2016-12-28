/**
 * Created by Sulf on 12/28/2016.
 */
const _colors = [
    '#FFE5A0',
    '#FFA77B',
    '#9CAFFB',
    '#CB88FC',
    '#87D3D5',
    '#F8869A',
    '#9CE0C7'
];

module.exports = {
    getColor: function (which) {
        if(which > -1 && which < _colors.length) {
            return _colors[which];
        }
    }
};
