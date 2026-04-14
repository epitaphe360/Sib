import React from "react";
import { Button } from "@strapi/design-system/Button";
import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import { useIntl } from "react-intl";
import Mail from "@strapi/icons/Mail";
import axios from "axios";

const SendEbadge = () => {
	const { formatMessage } = useIntl();
	const { modifiedData, layout } = useCMEditViewDataManager();
	const allowedTypes = ["user"];
	if (!allowedTypes.includes(layout.apiID)) {
		return <></>;
	}

	const onSendCreds = async () => {
		await axios.post(process.env.STRAPI_ADMIN_BACKEND_URL + "/api/users/sendCreds/" + modifiedData.id, null).then((response) => {
			console.log(response);
		});
		alert("Les accès ont été envoyé avec succés");
	};

	return (
		<>
			<Button variant="primary" size="L" fullWidth startIcon={<Mail />} onClick={onSendCreds} style={{ margin: "10px 0px" }}>
				{formatMessage({
					id: "components.SendEbadge.button",
					defaultMessage: "Envoyer les accès du compte",
				})}
			</Button>
		</>
	);
};

export default SendEbadge;
