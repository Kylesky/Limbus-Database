import { useState } from 'react';

import { identities } from 'items/identity';
import css from "./app.module.css";
import IdentityView from 'views/identityView';
import IdentityList from 'views/identityList';
import TeamBuilding from 'views/teamBuilding';

function App() {
    let [id, setId] = useState<string>("");
    let [page, setPage] = useState<number>(1);

    return (
        <div className={css.App}>
            <header className={css.AppHeader}>
                <span className={css.headerLink} onClick={() => {if(page === 1) setId(""); else setPage(1);}}>Identities List</span>
                <span className={css.headerLink} onClick={() => {setPage(2);}}>Team Building</span>
            </header>
            <div className={css.AppContent}>
                {page === 1 ? (id === "" ? <IdentityList setIdFunction={setId} /> : <IdentityView identity={identities[id]} />) : null}
                {page === 2 ? <TeamBuilding /> : null}
            </div>
        </div>
    );
}

export default App;
