import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setInfoData, sendContactMail, hideModal } from '../../redux/modules/contracts';
import classNames from 'classnames';

@connect(
    state => ({contactMailStatus: state.contracts.contactMailStatus, modalStatus: state.contracts.modalStatus, sendInfoData: state.contracts.sendInfoData, sendInfoErrors: state.contracts.sendInfoErrors}),
    dispatch => bindActionCreators({setInfoData, sendContactMail, hideModal}, dispatch))
class ContactModal extends React.Component {
	static propTypes = {
		contactMailStatus: PropTypes.string,
		modalStatus: PropTypes.string,
		sendInfoData: PropTypes.object,
		setInfoData: PropTypes.func,
		sendContactMail: PropTypes.func,
		hideModal: PropTypes.func,
	}

	closeHandler = () => {
		this.props.hideModal();
	};

	changeFieldHandler = (evt) => {
		const newValue = evt.target.value;
		const fieldName = evt.target.name;
		this.props.setInfoData({[fieldName]: newValue});
	};

	sendHandler = (evt) => {
		evt.preventDefault();
		const sendInfoData = this.props.sendInfoData;
		const request = this.props.sendContactMail({
			subject: `${sendInfoData.subject} [${sendInfoData.organization}]`,
			email: sendInfoData.email,
			text: sendInfoData.text
		});

		request.done(() => {
			this.subjectInput.value = '';
			this.emailInput.value = '';
			this.textInput.value = '';
		});
	};

	render() {
		const hideModal = this.props.modalStatus === 'closed';
		const organization = this.props.sendInfoData.organization;
		const errorEmail = this.props.sendInfoErrors.errorEmail;
		const errorEmailLegend = this.props.sendInfoErrors.errorEmailLegend;
		const errorText = this.props.sendInfoErrors.errorText;
		const errorTextLegend = this.props.sendInfoErrors.errorTextLegend;
		return (
			<div className={classNames(["contact-modal",  {"wg-hide": hideModal}])}>
				<div className="wg-modal-backdrop">
					<div className="wg-modal-body">
						<form action="#" onSubmit={this.sendHandler} className="info-form">
							<div onClick={this.closeHandler} className="wg-modal-close-button"/>
							<span className="wg-modal-title">Enviar más información sobre {organization}</span>
							<div className="wg-modal-info">
								<p className="modal-legend">PODER y sus aliados están investigando todo el proceso de contratación y ejecución del Nuevo Aeropuerto Internacional de la Ciudad de México (NAICM).</p>
								<p className="modal-legend">Si tienes documentos, fotografías o vídeos con más información sobre contratos, empresarios, obras o cualquier otro asunto referente al NAICM comunicalo a través del siguiente formulario o de forma anónima por Méxicoleaks.</p>
								<label className="field-row">
									<div className="field-row-wrapper">
										<input className="field-row-input" 
										ref={(subjectInput) => { this.subjectInput = subjectInput; }}
										type="text" placeholder="asunto" name="subject" onChange={this.changeFieldHandler}/>
									</div>
								</label>
								<label className="field-row">
									<div className="field-row-wrapper">
										{errorEmail ? <span className="input-error-legend">{errorEmailLegend}</span> : null}
										<input className="field-row-input"
										ref={(emailInput) => { this.emailInput = emailInput; }}
										type="text" placeholder="email" name="email" onChange={this.changeFieldHandler}/>
									</div>
								</label>
								<label className="field-row">
									<div className="field-row-wrapper">
										{errorText ? <span className="input-error-legend">{errorTextLegend}</span> : null}
										<textarea className="field-row-input field-textarea"
										placeholder="mensaje"
										ref={(textInput) => { this.textInput = textInput; }}
										name="text" id="" cols="30" rows="10" onChange={this.changeFieldHandler}></textarea>
									</div>
								</label>
							</div>
							<div className="wg-modal-actions">
								<button type="button" className="send-info-button button-cancel" onClick={this.closeHandler}>Cancel</button>
								<button type="submit" className="send-info-button button-send">Enviar</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

module.exports = ContactModal;