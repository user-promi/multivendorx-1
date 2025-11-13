import { useState, useEffect, useMemo, useCallback } from 'react';
import './storeRegistration.scss';
import { FormViewer, getApiLink, ToggleSetting } from 'zyra';
import axios from 'axios';

const RegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [responseData, setResponseData] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [inputs, setInputs] = useState<Record<string, any>>({});
    const formData = registrationForm;

    // useEffect(() => {

    //     axios({
    //         method: 'GET',
    //         url: getApiLink(appLocalizer, `store`),
    //         headers: { 'X-WP-Nonce': appLocalizer.nonce },
    //         params: { "store_registration": true },

    //     }).then((res) => {
    //         const data = res.data || {};
    //         const storeList = data.all_stores || [];
    //         const regData = data.response || [];
    //         setStores(storeList);
    //         setResponseData(regData);

    //         if (storeList.length > 0 && regData.length > 0) {
    //             // const firstStore = storeList[0];
    //             // setSelectedStore(firstStore);
    //             // const match = regData.find(
    //             //     (item) => String(item.id) === String(firstStore.value)
    //             //     );
    //             // if (match) setInputs(match);

    //             const match = storeList.find((store) =>
    //                 regData.some((item) => String(item.id) === String(store.value))
    //             );

    //             if (match) {
    //                 setSelectedStore(match);

    //                 // Find the corresponding registration data
    //                 const matchData = regData.find(
    //                     (item) => String(item.id) === String(match.value)
    //                 );

    //                 if (matchData) setInputs(matchData);
    //             }
    //         }
    //     });
    // }, []);

    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { store_registration: true },
        }).then((res) => {
            const data = res.data || {};
            const storeList = data.all_stores || [];
            const regData = data.response || [];

            //Prevent unnecessary re-renders
            setStores((prev) => {
                if (JSON.stringify(prev) !== JSON.stringify(storeList)) {
                    return storeList;
                }
                return prev;
            });

            setResponseData((prev) => {
                if (JSON.stringify(prev) !== JSON.stringify(regData)) {
                    return regData;
                }
                return prev;
            });

            if (storeList.length > 0 && regData.length > 0) {
                const match = storeList.find((store: any) =>
                    regData.some((item: any) => String(item.id) === String(store.value))
                );

                if (match) {
                    setSelectedStore(match);

                    const matchData = regData.find(
                        (item) => String(item.id) === String(match.value)
                    );

                    if (matchData) setInputs(matchData);
                }
            }
        });
    }, []);

    const handleStoreChange = (val: string) => {
        const store = stores.find((s) => s.value === val);
        setSelectedStore(store);

        const match = responseData.find(
            (item) => String(item.id) === String(val)
        );
        setInputs(match || {});
    };

    // const onSubmit = (submittedFormData: Record<string, any>) => {
    //     setLoading(true);

    //     // Map form field keys to backend expected keys
    //     const mappedData: Record<string, any> = {};

    //     // Core fields
    //     if (submittedFormData['name']) mappedData['name'] = submittedFormData['name'];
    //     if (submittedFormData['description'] || submittedFormData['description'])
    //         mappedData['description'] = submittedFormData['description'] || submittedFormData['description'];

    //     // Optional: slug, who_created (if coming from form)
    //     if (submittedFormData['slug']) mappedData['slug'] = submittedFormData['slug'];

    //     // Other fields as meta
    //     Object.keys(submittedFormData).forEach((key) => {
    //         if (!['name', 'description', 'slug'].includes(key)) {
    //             mappedData[key] = submittedFormData[key];
    //         }
    //     });

    //     // Send to API
    //     axios({
    //         method: 'POST',
    //         url: getApiLink(registrationForm, 'store'),
    //         headers: { 'X-WP-Nonce': registrationForm.nonce, "registrations": 'registrations' },
    //         data: {
    //             formData: mappedData,
    //         },
    //     })
    //         .then((response) => {
    //             console.log('Store created:', response.data);
    //             if (response.data.redirect !== '') {
    //                 window.location.href = response.data.redirect;
    //             }
    //             setLoading(false);
    //         })
    //         .catch((error) => {
    //             console.error('Error creating store:', error);
    //             setLoading(false);
    //         });
    // };
    const onSubmit = useCallback((submittedFormData: Record<string, any>) => {
        setLoading(true);

        const mappedData: Record<string, any> = {};

        if (submittedFormData['name']) mappedData['name'] = submittedFormData['name'];
        if (submittedFormData['description']) mappedData['description'] = submittedFormData['description'];
        if (submittedFormData['slug']) mappedData['slug'] = submittedFormData['slug'];

        Object.keys(submittedFormData).forEach((key) => {
            if (!['name', 'description', 'slug'].includes(key)) {
                mappedData[key] = submittedFormData[key];
            }
        });

        axios({
            method: 'POST',
            url: getApiLink(registrationForm, 'store'),
            headers: { 'X-WP-Nonce': registrationForm.nonce, "registrations": 'registrations' },
            data: { formData: mappedData },
        })
            .then((response) => {
                console.log('Store created:', response.data);
                if (response.data.redirect !== '') {
                    window.location.href = response.data.redirect;
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error creating store:', error);
                setLoading(false);
            });
    }, []); //empty dependencies = stable function

    const memoizedCountryList = useMemo(() => appLocalizer.country_list, []);
    const memoizedStateList = useMemo(() => appLocalizer.state_list, []);

    return (
        <div className="enquiry-form-modal">
            {loading && (
                <section className="loader-wrapper">
                    <div className="loader-item">
                        <div className="three-body-dot"></div>
                        <div className="three-body-dot"></div>
                        <div className="three-body-dot"></div>
                    </div>
                </section>
            )}
            {stores.length > 0 && (
                <div className="store-selector">
                    <ToggleSetting
                        wrapperClass="setting-form-input"
                        options={stores}
                        value={selectedStore?.value || ""}
                        onChange={(val: any) => handleStoreChange(val)}
                    />
                </div>
            )}

            <div className="modal-wrapper">
                <div>{registrationForm.content_before_form}</div>

                <FormViewer
                    formFields={formData.settings}
                    response={inputs}
                    onSubmit={onSubmit}
                    countryList={memoizedCountryList}
                    stateList={memoizedStateList}
                />
                <div>{registrationForm.content_after_form}</div>
                {toast && (
                    <div className="admin-notice-display-title">
                        <i className="admin-font adminlib-icon-yes"></i>
                        {responseMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationForm;
