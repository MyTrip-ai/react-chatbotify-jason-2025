import React, { CSSProperties } from "react";

import { Button } from "../constants/Button";
import { Theme } from "../types/Theme";
import { Settings } from "../types/Settings";
import { Styles } from "../types/Styles";
import resortWordmark from "../assets/resort_wordmark.svg";
import myTripLogo from "../assets/mytrip_logo.png";

export const myTripTheme: Theme = {
	id: "mytrip-ai",
	version: "1.0.0",
};

const glassChatWindow: CSSProperties = {
	borderRadius: "24px",
	background: "rgba(255, 255, 255, 0.75)",
	border: "1px solid rgba(165, 217, 210, 0.35)",
	boxShadow: "0 30px 80px rgba(93, 128, 120, 0.12)",
	backdropFilter: "blur(20px)",
	padding: "16px 24px",
};

const tropicalHeader: CSSProperties = {
	borderBottom: "1px solid rgba(165, 217, 210, 0.4)",
	padding: "8px 0",
};

const tropicalBody: CSSProperties = {
	padding: "24px 32px 32px",
};

const translucentInput: CSSProperties = {
	padding: "16px 24px",
	borderTop: "1px solid rgba(165, 217, 210, 0.4)",
	background: "rgba(255, 255, 255, 0.75)",
	backdropFilter: "blur(8px)",
};

const translucentInputArea: CSSProperties = {
	padding: "10px 16px",
	border: "1px solid rgba(165, 217, 210, 0.6)",
	borderRadius: 999,
	background: "transparent",
};

const floatingBaseSettings: Partial<Settings> = {
	general: {
		primaryColor: "#79C1B3",
		secondaryColor: "#79C1B3",
		fontFamily: "'Lato', 'Avenir', 'Helvetica Neue', sans-serif",
		showHeader: true,
		showFooter: true,
		showInputRow: true,
	},
	header: {
		title: "AI Travel Assistant",
		showAvatar: true,
		avatar: resortWordmark,
		buttons: [Button.CLOSE_CHAT_BUTTON],
	},
	footer: {
		text: (
			<div
				style={{cursor: "pointer", display: "flex", flexDirection: "row", alignItems: "center", columnGap: 6}}
				onClick={() => window.open("https://mytrip.ai", "_blank", "noopener,noreferrer")}
			>
				<span key={0}>Powered By</span>
				<img
					key={1}
					src={myTripLogo}
					alt="MyTrip.AI logo"
					style={{ width: 20, height: 20, objectFit: "contain" }}
				/>
				<span key={2} style={{fontWeight: "bold"}}>MyTrip.AI</span>
			</div>
		),
		buttons: [],
	},
	chatInput: {
		botDelay: 1000,
		buttons: [Button.SEND_MESSAGE_BUTTON],
	},
	voice: {
		disabled: true,
	},
	botBubble: {
		showAvatar: true,
	},
	userBubble: {
		showAvatar: false,
	},
};

const floatingBaseStyles: Styles = {
	chatWindowStyle: {
		...glassChatWindow,
		position: "fixed",
		right: 20,
		bottom: 20,
		width: 420,
		height: 580,
	},
	headerStyle: tropicalHeader,
	bodyStyle: tropicalBody,
	chatInputContainerStyle: translucentInput,
	chatInputAreaStyle: translucentInputArea,
	botBubbleStyle: {
		backgroundColor: "rgba(255, 255, 255, 0.75)",
		border: "1px solid #79c1b3",
	},
	userBubbleStyle: {
		backgroundColor: "rgba(255, 255, 255, 0.75)",
		border: "1px solid #998167",
	},
	botOptionStyle: {
		border: "1px solid rgba(165, 217, 210, 0.6)",
		borderRadius: 999,
	},
};

export const myTripFloatingSettings: Partial<Settings> = {
	...floatingBaseSettings,
	general: {
		...floatingBaseSettings.general,
		embedded: false,
	},
};

export const myTripFloatingStyles: Styles = floatingBaseStyles;

export const myTripEmbeddedSettings: Partial<Settings> = {
	...floatingBaseSettings,
	general: {
		...floatingBaseSettings.general,
		embedded: true,
	},
};

export const myTripEmbeddedStyles: Styles = {
	...floatingBaseStyles,
	chatWindowStyle: {
		...glassChatWindow,
		position: "relative",
		width: "100%",
		height: "auto",
		boxShadow: "none",
		padding: 0,
	},
	chatButtonStyle: {
		display: "none",
	},
};
