import React from "react";
import Avatar from "@mui/material/Avatar";

const avatarColors = {
  red: {
    top: "#FF845E",
    bottom: "#D45246",
  },
  orange: {
    top: "#FEBB5B",
    bottom: "#F68136",
  },
  violet: {
    top: "#B694F9",
    bottom: "#6C61DF",
  },
  green: {
    top: "#9AD164",
    bottom: "#46BA43",
  },
  cyan: {
    top: "#53edd6",
    bottom: "#28c9b7",
  },
  blue: {
    top: "#5CAFFA",
    bottom: "#408ACF",
  },
  pink: {
    top: "#FF8AAC",
    bottom: "#D95574",
  },
  archive: {
    top: "#B8C2CC",
    bottom: "#9EAAB5",
  },
};

const stringAvatar = (name, color) => {
  const nameParts = name.split(" ");
  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : `${nameParts[0][0]}`;
  const gradientColor = avatarColors[color] || avatarColors.archive;

  return {
    sx: {
      background: `linear-gradient(to bottom, ${gradientColor.top}, ${gradientColor.bottom})`,
      width: 55,
      height: 55,
      fontSize: 25,
      fontWeight: "semibold",
      color: "#ffffff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    children: initials.toUpperCase(),
  };
};

const stringAvatar2 = (name, color) => {
  const nameParts = name.split(" ");
  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : `${nameParts[0][0]}`;

  const gradientColor = avatarColors[color] || avatarColors.archive;

  return {
    sx: {
      background: `linear-gradient(to bottom, ${gradientColor.top}, ${gradientColor.bottom})`,
      width: 40,
      height: 40,
      fontSize: 25,
      fontWeight: "semibold",
      color: "#ffffff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    children: initials.toUpperCase(),
  };
};

export const CustomAvatar = ({ name, color }) => {
  return <Avatar {...stringAvatar(name || "Anonymous", color)} />;
};

export const CustomAvatar2 = ({ name, color }) => {
  return <Avatar {...stringAvatar2(name || "Anonymous", color)} />;
};
