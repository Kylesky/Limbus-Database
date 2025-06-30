import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import { Info } from "views/info";
import { Details } from "views/details";
import { Summary } from "views/summary";
import { identity } from 'items/identity';
import css from "./identityView.module.css";
import { IdFlowchart } from 'views/flowchart/idFlowchart';

type IdentityViewProps = {
    identity: identity
}

function IdentityView({ identity }: IdentityViewProps) {
    return (
        <div className={css.wrapper}>
            <div className={css.info}>
                <Info item={identity} />
                <Tabs className={css.tabs} selectedTabClassName={css.selectedTab} selectedTabPanelClassName={css.selectedTabPanel}>
                    <TabList className={css.tabList}>
                        <Tab className={css.tab}>Summary</Tab>
                        <Tab className={css.tab}>Details</Tab>
                    </TabList>

                    <TabPanel className={css.tabPanel}>
                        <Summary item={identity} />
                    </TabPanel>
                    <TabPanel className={css.tabPanel}>
                        <Details item={identity} />
                    </TabPanel>
                </Tabs>
            </div>
            {"flowChart" in identity ? <div className={css.flowChart}><IdFlowchart item={identity} /></div>:null}            
        </div>
    );
}

export default IdentityView;
