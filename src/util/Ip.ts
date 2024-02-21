/**
 * Returns a regex pattern for grouping IP address segments.
 * @param value - The value of the segment.
 * @param of - Specifies the type of the segment. Defaults to true.
 * @param min - Minimum occurrence of the segment.
 * @param max - Maximum occurrence of the segment.
 * @returns A regex pattern for the IP address segment.
 */
const group = (value: string, of: string | boolean = true, min?: number, max?: number): string => {
    let suffix: string;
    const prefix = of === true ? '' : of === false ? '?:' : `?<${of}>`;

    if (min !== undefined) {
        if (min === 0 && max === undefined)
            suffix = '?';
        else if (min === 0 && max === Infinity)
            suffix = '*';
        else if (max === 0 && max === Infinity)
            suffix = '+';
        else if (min !== max && max !== undefined)
            suffix = `{${min},${max}}`;
        else
            suffix = `{${min}}`;
    }
    else if (max !== undefined)
        suffix = `{,${max}}`;
    else
        suffix = '';

    return `(${prefix}${value})${suffix}`;
};

/**
 * Regex pattern for a unit in IPv4 address.
 */
const ipv4Unit = '(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[0-9]{1,2})';

/**
 * Regex pattern for IPv4 address.
 */
const ipv4 = group(ipv4Unit, 'class') + '\.' + group(ipv4Unit, 'network') + '\.' + group(ipv4Unit, 'subnet') + '\.' + group(ipv4Unit, 'device');

/**
 * Regex pattern for a unit in IPv6 address.
 */
const ipv6Unit = '[0-9a-f]{1,4}';

/**
 * Returns a regex pattern for grouping IPv6 address units.
 * @param before - Number of units before the '::'.
 * @param after - Number of units after the '::'.
 * @returns A regex pattern for the grouped IPv6 address units.
 */
const units = (before: number, after: number): string => {
    let result = '';

    if (before)
        result += group(`${ipv6Unit}:`, false, before);
    else
        result += ':';

    if (after) {
        result += ':';
        result += group(`${ipv6Unit}:`, false, 0, after);
    }

    return group(result, `_${before}_${after}`);
};

/**
 * Regex pattern for IPv6 prefix.
 */
const ipv6Prefix = '::' + '|' + group([
    units(7, 0),
    units(6, 1),
    units(5, 2),
    units(4, 3),
    units(3, 4),
    units(2, 5),
    units(1, 6),
    units(0, 7)
].join('|'), false);

/**
 * Regex pattern for plain IPv6 address.
 */
const ipv6Plain = ipv6Prefix + group(ipv6Unit, 'suffix');

/**
 * Regex pattern for mixed IPv6 and IPv4 address.
 */
const ipv6Mixed = ipv6Prefix + group(ipv6Unit + '|' + group(ipv4, 'ipv4'), 'suffix');

/**
 * Object containing sealed regex patterns for IP addresses.
 */
export const Ip = Object.seal(
    {
        /**
         * Regex pattern for IPv4 address.
         */
        v4: new RegExp(`^(${ipv4})$`, 'i'),

        /**
         * Regex pattern for plain IPv6 address.
         */
        v6: new RegExp(`^(${ipv6Plain})$`, 'i'),

        /**
         * Regex pattern for mixed IPv6 and IPv4 address.
         */
        v6v4: new RegExp(`^(${ipv6Mixed})$`, 'i')
    } as const
);
