const SignupInfo= ({ message, code }) => {
    return (
        <div className={`signup-info-container ${code === 201 ? 'signup-info-success' : 'signup-info-error'}`}>
            {code === 201 && <img src="checkmark-icon.svg" alt="checkmark" className="signup-info-icon" />}
            {code !== 201 && <img src="warning-icon.svg" alt="warning icon" className="signup-info-icon" />}
            <p className="signup-info-message">{message}</p>
        </div>
    );
}
export default SignupInfo;