import { useState, useEffect } from 'react';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';
import axios from 'axios';

const Verification = () => {
    const appLocalizer = (window as any).appLocalizer;
    const allVerificationMethods = appLocalizer.all_verification_methods;
    const [connectedProfiles, setConnectedProfiles] = useState<any>({});
    const [loading, setLoading] = useState<string>('');
    const [profileLoading, setProfileLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchConnectedProfiles();
    }, []);

    const fetchConnectedProfiles = async () => {
        try {
            setProfileLoading(true);
            const response = await axios({
                method: 'GET',
                url: getApiLink(appLocalizer, 'store/social-profiles'),
                headers: { 
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = response.data;
            if (data.success) {
                setConnectedProfiles(data.data || {});
            }
        } catch (error) {
            console.error('Error fetching connected profiles:', error);
        } finally {
            setProfileLoading(false);
        }
    };

    const connectSocialProfile = async (provider: string) => {
        setLoading(provider);
        try {
            const response = await axios({
                method: 'POST',
                url: getApiLink(appLocalizer, 'store/connect-social'),
                headers: { 
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Content-Type': 'application/json'
                },
                data: { provider }
            });
            
            const data = response.data;
            if (data.success && data.data.redirect_url) {
                window.location.href = data.data.redirect_url;
            } else {
                alert('Failed to connect: ' + (data.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('Error connecting social profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to connect social profile';
            alert(errorMessage);
        } finally {
            setLoading('');
        }
    };

    const disconnectSocialProfile = async (provider: string) => {
        if (!confirm('Are you sure you want to disconnect this social profile?')) return;

        try {
            const response = await axios({
                method: 'POST',
                url: getApiLink(appLocalizer, 'store/disconnect-social'),
                headers: { 
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Content-Type': 'application/json'
                },
                data: { provider }
            });
            
            const data = response.data;
            if (data.success) {
                setConnectedProfiles((prev: any) => {
                    const updated = { ...prev };
                    delete updated[provider];
                    return updated;
                });
                alert('Social profile disconnected successfully');
            } else {
                alert('Failed to disconnect: ' + (data.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('Error disconnecting social profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to disconnect social profile';
            alert(errorMessage);
        }
    };

    const getSocialStatus = (provider: string) => {
        return connectedProfiles[provider] ? 'connected' : 'not_connected';
    };

    const getButtonConfig = (provider: string) => {
        const status = getSocialStatus(provider);
        
        switch (status) {
            case 'connected':
                return {
                    text: 'Connected',
                    class: 'admin-btn btn-green',
                    action: () => disconnectSocialProfile(provider),
                    disabled: false
                };
            case 'not_connected':
                return {
                    text: loading === provider ? 'Connecting...' : 'Connect',
                    class: 'admin-btn btn-purple',
                    action: () => connectSocialProfile(provider),
                    disabled: loading !== ''
                };
            default:
                return {
                    text: 'Connect',
                    class: 'admin-btn btn-purple',
                    action: () => connectSocialProfile(provider),
                    disabled: false
                };
        }
    };

    const renderSocialVerification = () => {
        const socialConfigs = [
            { 
                provider: 'linkedin', 
                icon: 'adminlib-linkedin yellow', 
                name: 'Verify via LinkedIn',
                enabled: allVerificationMethods?.['social-verification']?.social_verification_methods?.['linkedin-connect']?.enable
            },
            { 
                provider: 'google', 
                icon: 'adminlib-google yellow', 
                name: 'Verify via Google',
                enabled: allVerificationMethods?.['social-verification']?.social_verification_methods?.['google-connect']?.enable
            },
            { 
                provider: 'facebook', 
                icon: 'adminlib-facebook yellow', 
                name: 'Verify via Facebook',
                enabled: allVerificationMethods?.['social-verification']?.social_verification_methods?.['facebook-connect']?.enable
            },
            { 
                provider: 'twitter', 
                icon: 'adminlib-twitter yellow', 
                name: 'Verify via Twitter',
                enabled: allVerificationMethods?.['social-verification']?.social_verification_methods?.['twitter-connect']?.enable
            }
        ];

        if (profileLoading) {
            return (
                <div className="varification-wrapper">
                    <div className="left">
                        <div className="name">Loading social profiles...</div>
                    </div>
                </div>
            );
        }

        return socialConfigs.map((social) => {
            if (!social.enabled) return null;
            
            const buttonConfig = getButtonConfig(social.provider);
            
            return (
                <div key={social.provider} className="varification-wrapper">
                    <div className="left">
                        <i className={social.icon}></i>
                        <div className="name">{social.name}</div>
                    </div>
                    <div className="right">
                        <button 
                            className={buttonConfig.class}
                            onClick={buttonConfig.action}
                            disabled={buttonConfig.disabled}
                        >
                            {buttonConfig.text}
                        </button>
                    </div>
                </div>
            );
        }).filter(Boolean);
    };

    return (
        <>
            <div className="card-wrapper">
                <div className="card-content">
                    <div className="card-title">Identity Documents</div>
                    
                    {/* Identity Verification Methods */}
                    {allVerificationMethods?.['id-verification']?.verification_methods?.map((method: any, index: number) => (
                        method.active && (
                            <div key={index} className="varification-wrapper">
                                <div className="left">
                                    <i className="adminlib-verification3 yellow"></i>
                                    <div className="name">{method.label}</div>
                                    {method.required && <span className="required-badge">Required</span>}
                                </div>
                                <div className="right">
                                    <div className="admin-btn btn-purple">Verify Now</div>
                                </div>
                            </div>
                        )
                    ))}

                    <div className="card-title">Required Information</div>
                    
                    {/* Add your required information fields here */}

                    <div className="card-title">Social Profiles</div>
                    
                    {renderSocialVerification()}

                </div>
            </div>
        </>
    );
};

export default Verification;