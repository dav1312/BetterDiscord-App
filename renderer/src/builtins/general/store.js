import Builtin from "../../structs/builtin";
import {React, DiscordModules, WebpackModules} from "modules";
import { fetchAddon } from "../../ui/settings/addonlist/api";
import PluginManager from "../../modules/pluginmanager";
import ThemeManager from "../../modules/thememanager";
import StoreCard from "../../ui/settings/addonlist/storecard";
import openStoreDetail from "../../ui/settings/addonlist/storedetail";
import Modals from "../../ui/modals";

import { URL } from "url";

const protocol = "betterdiscord://";
const protocolRegex = new RegExp(protocol, "i");

export default new class Store extends Builtin {
    get name() {return "Store";}
    get category() {return "general";}
    get id() {return "store";}

    enabled() {
        this.patchMarkdownParser();
        this.patchTrustedModule();
        this.patchEmbeds();
    }

    patchEmbeds() {
        const MessageAccessories = WebpackModules.getByProps("MessageAccessories")?.MessageAccessories;
        const AUTOLINK_REGEX = new RegExp("^<([^: >]+:/[^ >]+)>");

        if (!MessageAccessories.prototype.renderEmbeds) return;

        this.instead(MessageAccessories.prototype, "renderEmbeds", (thisObject, methodArguments, renderEmbeds) => {
            const embeds = Reflect.apply(renderEmbeds, thisObject, methodArguments);
            const matchedProtocol = methodArguments[0]?.content.match(AUTOLINK_REGEX)?.[1].replace(/\s+/g, ' ').trim();

            if (!protocolRegex.test(matchedProtocol)) return embeds;

            const url = new URL(matchedProtocol);

            if (url.hostname === "addon") {
                const addon = url.pathname.slice(1);

                return addon ? [
                    ...(embeds ? embeds : []),
                    React.createElement(EmbeddedStoreCard, { addon })
                ] : embeds;
            }

            return embeds;
        });
    }

    patchTrustedModule() {
        const TrustedModule = WebpackModules.getByProps("isLinkTrusted", "handleClick");

        if (!TrustedModule) return;

        this.instead(TrustedModule, "handleClick", (thisObject, methodArguments, handleClick) => {
            const [{href, onClick}, event] = methodArguments;

            if (protocolRegex.test(href)) {
                if (typeof onClick === "function") onClick(event);

                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                return true;
            }

            return Reflect.apply(handleClick, thisObject, methodArguments);
        });
    }

    patchMarkdownParser() {
        const { SimpleMarkdown } = DiscordModules;

        if (!SimpleMarkdown || !SimpleMarkdown.defaultRules.link) return;

        this.after(SimpleMarkdown.defaultRules.link, "react", (_, [{target: url}], returnValue) => {
            if (!protocolRegex.test(url)) return;

            return this.renderContent(url, returnValue);
        });
    }

    renderContent(path, link) {
        const url = new URL(path);

        if (url.hostname === "addon") {
            const addon = url.pathname.slice(1);

            if (!addon) return link;

            link.props.onClick = (e) => {
                Modals.showInstallationModal({ ...this.state.addon, folder: this.folder });
            }
        }

        return link;
    }

    disabled() {
        this.unpatchAll();
    }
};

class EmbeddedStoreCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            addon: null
        };
    }

    componentDidMount() {
        fetchAddon(this.props.addon).then(data => {
            if (data.id) this.setState({ addon: data });
        });
    }

    isInstalled = (name) => {
        return this.state.addon.type === "theme" ? ThemeManager.isLoaded(name) : PluginManager.isLoaded(name);
    }

    get folder() {
        return this.state.addon.type === "theme" ? ThemeManager.addonFolder : PluginManager.addonFolder;
    }

    render() {
        const {addon} = this.state;

        return [
            addon ? React.createElement(StoreCard, {
                ...addon,
                folder: this.folder,
                isInstalled: this.isInstalled(addon.name),
                className: "bd-store-card-embedded",
                onDetailsView: () => {
                    openStoreDetail(addon);
                }
            }) : null
        ]
    }
}