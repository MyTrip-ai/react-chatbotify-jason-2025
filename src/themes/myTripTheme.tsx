import React, { CSSProperties } from "react";

import { Button } from "../constants/Button";
import { Theme } from "../types/Theme";
import { Settings } from "../types/Settings";
import { Styles } from "../types/Styles";
import { BrandTokens, defaultBrandTokens } from "../types/BrandTokens";
import resortWordmark from "../assets/resort_wordmark.svg";
import myTripLogo from "../assets/mytrip_logo.png";

export const myTripTheme: Theme = {
	id: "mytrip-ai",
	version: "1.0.0",
};

const glassChatWindow = (branding: BrandTokens): CSSProperties => ({
	borderRadius: "24px",
	background: `rgba(255, 255, 255, ${branding.surfaceAlpha})`,
	border: `1px solid ${branding.primary}40`,
	boxShadow: "0 30px 80px rgba(93, 128, 120, 0.12)",
	backdropFilter: `blur(${branding.blurPx}px)`,
	padding: "16px 24px",
});

const tropicalHeader = (branding: BrandTokens): CSSProperties => ({
	borderBottom: `1px solid ${branding.primary}66`,
	padding: "8px 0",
});

const tropicalBody = (): CSSProperties => ({
	padding: "24px 32px 32px",
});

const translucentInput = (branding: BrandTokens): CSSProperties => ({
	padding: "16px 24px",
	borderTop: `1px solid ${branding.primary}66`,
	background: `rgba(255, 255, 255, ${branding.surfaceAlpha})`,
	backdropFilter: `blur(${Math.floor(branding.blurPx * 0.4)}px)`,
});

const translucentInputArea = (branding: BrandTokens): CSSProperties => ({
	padding: "10px 16px",
	border: `1px solid ${branding.primary}99`,
	borderRadius: 999,
	background: "transparent",
});

const floatingBaseSettings = (branding: BrandTokens): Partial<Settings> => ({
	general: {
		primaryColor: branding.primary,
		secondaryColor: branding.secondary,
		fontFamily: branding.fontFamily,
		showHeader: true,
		showFooter: true,
		showInputRow: true,
	},
	branding: branding,
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
});

const floatingBaseStyles = (branding: BrandTokens): Styles => ({
	chatWindowStyle: {
		...glassChatWindow(branding),
		position: "fixed",
		right: 20,
		bottom: 20,
		width: 420,
		height: 580,
	},
	headerStyle: tropicalHeader(branding),
	bodyStyle: tropicalBody(),
	chatInputContainerStyle: translucentInput(branding),
	chatInputAreaStyle: translucentInputArea(branding),
	botBubbleStyle: {
		backgroundColor: `rgba(255, 255, 255, ${branding.surfaceAlpha})`,
		border: `1px solid ${branding.primary}`,
	},
	userBubbleStyle: {
		backgroundColor: `rgba(255, 255, 255, ${branding.surfaceAlpha})`,
		border: `1px solid ${branding.userAccent}`,
	},
	botOptionStyle: {
		border: `1px solid ${branding.primary}99`,
		borderRadius: 999,
	},
});

export const myTripFloatingSettings = (branding: BrandTokens = defaultBrandTokens): Partial<Settings> => {
	const baseSettings = floatingBaseSettings(branding);
	return {
		...baseSettings,
		general: {
			...baseSettings.general,
			embedded: false,
		},
	};
};

export const myTripFloatingStyles = (branding: BrandTokens = defaultBrandTokens): Styles => 
	floatingBaseStyles(branding);

export const myTripEmbeddedSettings = (branding: BrandTokens = defaultBrandTokens): Partial<Settings> => {
	const baseSettings = floatingBaseSettings(branding);
	return {
		...baseSettings,
		general: {
			...baseSettings.general,
			embedded: true,
		},
	};
};

export const myTripEmbeddedStyles = (branding: BrandTokens = defaultBrandTokens): Styles => ({
	...floatingBaseStyles(branding),
	chatWindowStyle: {
		...glassChatWindow(branding),
		position: "relative",
		width: "100%",
		height: "auto",
		boxShadow: "none",
		padding: "16px 24px", // Keep the same padding as floating mode
	},
	chatButtonStyle: {
		display: "none",
	},
});
