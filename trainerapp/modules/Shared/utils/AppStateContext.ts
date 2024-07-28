import React from 'react';

const AppStateContext = React.createContext({
    isDatabaseSynced: false,
    setDatabaseSynced: (value: boolean) => {},
});

export default AppStateContext;