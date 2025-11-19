import React, { Fragment, isValidElement } from "react";

import { useSettingsContext } from "../../context/SettingsContext";
import { useStylesContext } from "../../context/StylesContext";

import "./ChatBotHeader.css";

/**
 * Contains header buttons and avatar.
 * 
 * @param buttons list of buttons to render in the header
 */
const ChatBotHeader = ({ buttons }: { buttons: JSX.Element[] }) => {
	// handles settings
	const { settings } = useSettingsContext();

	// handles styles
	const { styles } = useStylesContext();

	// styles for header
	const headerStyle: React.CSSProperties = {
		backgroundColor: "transparent",
		borderBottom: "1px solid rgba(165, 217, 210, 0.4)",
		padding: "8px 0",
		...styles.headerStyle
	};

	const titleStyle: React.CSSProperties = {
		margin: 0,
		fontSize: "1.6rem",
		fontWeight: 300,
		fontFamily: "Playfair Display, 'Cormorant Garamond', serif",
		color: "var(--color-accent-teal)",
		textAlign: "center"
	};

	return (
		<div style={headerStyle} className="rcb-chat-header-container">
			<div className="rcb-chat-header">
				{settings.header?.showAvatar &&
					<div 
						style={{backgroundImage: `url("${settings.header?.avatar}")`}}
						className="rcb-bot-avatar"
					/>
				}
				{isValidElement(settings.header?.title) ?
					settings.header?.title :
					<div style={titleStyle}>
						{settings.header?.title}
					</div>
				}
			</div>
			<div className="rcb-chat-header">
				{buttons?.map((button: JSX.Element, index: number) => 
					<Fragment key={index}>{button}</Fragment>
				)}
			</div>
		</div>
	);
};

export default ChatBotHeader;
