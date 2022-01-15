import {React} from "modules";

const className = "bd-settings-title h2-1EaYVL title-3hptVQ size16-2OrZ3x height20-mO2eIN weightSemiBold-NJexzi defaultColor-2cKwKo defaultMarginh2-t7G-2y marginBottom20-315RVT";
const className2 = "bd-settings-title bd-settings-group-title h5-2RwDNl title-3hptVQ size12-1rVdzL height16-1wDpVf weightSemiBold-NJexzi da-h5 da-title da-size12 da-height16 da-weightSemiBold marginBottom4-1fdMNe da-marginBottom4 marginTop8-24uXGp da-marginTop8";

export default class SettingsTitle extends React.Component {
    render() {
        const baseClass = this.props.isGroup ? className2 : className;
        const titleClass = this.props.className ? `${baseClass} ${this.props.className}` : baseClass;
        return <h2 className={titleClass} onClick={() => {this.props.onClick && this.props.onClick();}}>
                {this.props.text}
                {this.props.button && <button className="bd-button bd-button-title" onClick={this.props.button.onClick}>{this.props.button.title}</button>}
                {this.props.otherChildren}
                </h2>;
    }
}