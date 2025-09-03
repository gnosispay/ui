import { Step, Stepper } from "../components/stepper";
import { SideBar } from "../components/sidebar";
import type { ReactNode } from "react";

type StartLayoutProps = {
  children: ReactNode;
};

const StartLayout: React.FC<StartLayoutProps> = ({ children }) => {
  return (
    <div className="flex">
      <SideBar>
        <Stepper>
          <Step
            stepNumber={1}
            title="Link your card"
            status="current"
            showConnector
          />
          <Step
            stepNumber={2}
            title="Set up Safe"
            status="incomplete"
            showConnector
          />
          <Step stepNumber={3} title="View PIN" status="incomplete" />
        </Stepper>
      </SideBar>
      <div className="flex-grow overflow-auto sm:pl-64">{children}</div>
    </div>
  );
};

export default StartLayout;
