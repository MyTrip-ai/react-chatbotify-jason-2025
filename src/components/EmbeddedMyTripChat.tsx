import ChatBot from "./ChatBot";
import { myTripEmbeddedSettings, myTripEmbeddedStyles, myTripTheme } from "../themes/myTripTheme";
import { Flow } from "../types/Flow";

const EmbeddedMyTripChat = ({ flow }: { flow: Flow }) => (
	<ChatBot
		id="mytrip-embedded-chatbot"
		flow={flow}
		settings={myTripEmbeddedSettings}
		styles={myTripEmbeddedStyles}
		themes={myTripTheme}
	/>
);

export default EmbeddedMyTripChat;
