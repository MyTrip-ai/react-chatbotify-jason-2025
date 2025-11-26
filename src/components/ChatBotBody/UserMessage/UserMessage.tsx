import { CSSProperties } from "react";
import { useSettingsContext } from "../../../context/SettingsContext";
import { useStylesContext } from "../../../context/StylesContext";
import { Message } from "../../../types/Message";

import "./UserMessage.css";

/**
 * Renders message from the user.
 * 
 * @param message message to render
 * @param isNewSender whether this message is from a new sender
 */
const UserMessage = ({
	message,
	isNewSender,
}: {
	message: Message;
	isNewSender: boolean;
}) => {
	// handles settings
	const { settings } = useSettingsContext();

	// handles styles
	const { styles } = useStylesContext();

	const baseContent: React.ReactNode = message.content;

	// checks if content wrapper is defined to wrap around content
	const finalContent = message.contentWrapper ? (
		<message.contentWrapper>
			{baseContent}
		</message.contentWrapper>
	) : (
		baseContent
	);

	// styles for user bubble
	const userBubbleBackground = "rgba(255, 255, 255, 0.75)";
	const userBubbleStyle: CSSProperties = {
		backgroundColor: userBubbleBackground,
		color: "var(--color-text-primary)",
		border: "1px solid #998167",
		boxShadow: "0 8px 24px rgba(153, 129, 103, 0.18)",
		maxWidth: settings.userBubble?.showAvatar ? "65%" : "70%",
		...styles.userBubbleStyle,
	};
	const userBubbleEntryStyle = settings.userBubble?.animate ? "rcb-user-message-entry" : "";

	// determines whether it's a new sender (affects avatar display and offset)
	const showAvatar = settings.userBubble?.showAvatar && isNewSender;
	const offsetStyle = `rcb-user-message${!isNewSender && settings.userBubble?.showAvatar
		? " rcb-user-message-offset"
		: ""
	}`;

	return (
		<div className="rcb-user-message-container">
			<div style={userBubbleStyle} className={`${offsetStyle} ${userBubbleEntryStyle}`}>
				{finalContent}
			</div>
			{showAvatar && (
				<div
					style={{ backgroundImage: `url("${settings.userBubble?.avatar}")` }}
					className="rcb-message-user-avatar"
				/>
			)}
		</div>
	);
};

export default UserMessage;
