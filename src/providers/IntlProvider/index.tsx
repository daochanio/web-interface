"use client";

import { IntlProvider as IntlProviderComponent } from "react-intl";
import translations from "./translations";

function IntlProvider({ children }: { children: React.ReactNode }) {
  // detect locale from browser once we support more languages
  const locale = "en";
  const messages = translations[locale];
  return (
    <>
      <IntlProviderComponent
        messages={messages}
        locale={locale}
        defaultLocale="en"
      >
        {children}
      </IntlProviderComponent>
    </>
  );
}

export default IntlProvider;
