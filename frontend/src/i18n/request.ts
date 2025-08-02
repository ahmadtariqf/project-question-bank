import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers'

export default getRequestConfig(async ({ }) => {
    const cookieStore = await cookies();
    // 1. Try to get from cookie
    let locale = cookieStore.get('NEXT_LOCALE')?.value;
    // 2. If not set, fallback to 'ar'
    if (!locale) locale = 'ar';
    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});