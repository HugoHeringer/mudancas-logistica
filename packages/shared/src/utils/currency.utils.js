/**
 * Utilitários de moeda e formatação de valores
 */
export const DEFAULT_CURRENCY = 'EUR';
export const PT_LOCALE = 'pt-PT';
/**
 * Formata um valor como moeda
 */
export function formatCurrency(value, currency = DEFAULT_CURRENCY, locale = PT_LOCALE) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}
/**
 * Formata valor como Euro (€)
 */
export function formatEuro(value) {
    return formatCurrency(value, 'EUR', 'pt-PT');
}
/**
 * Parse de string de moeda para número
 */
export function parseCurrency(value) {
    // Remove tudo exceto dígitos, vírgula e menos
    const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}
/**
 * Calcula percentagem
 */
export function calculatePercentage(value, percentage) {
    return (value * percentage) / 100;
}
/**
 * Calcula margem (receita - custos)
 */
export function calculateMargin(revenue, costs) {
    return revenue - costs;
}
/**
 * Calcula margem percentual
 */
export function calculateMarginPercent(revenue, costs) {
    if (revenue === 0)
        return 0;
    return ((revenue - costs) / revenue) * 100;
}
/**
 * Formata número com separadores de milhar
 */
export function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat(PT_LOCALE, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}
/**
 * Soma valores de um array
 */
export function sumValues(values) {
    return values.reduce((acc, val) => acc + val, 0);
}
/**
 * Calcula média de valores
 */
export function averageValue(values) {
    if (values.length === 0)
        return 0;
    return sumValues(values) / values.length;
}
