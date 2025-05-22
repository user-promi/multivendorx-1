import AdminFooter from "../src/components/AdminFooter";

export default {
    title: "Zyra/Components/AdminFooter",
    component: AdminFooter,
};

export const TestAdminFooter = () => {
    const supportLink = [
        {
            title: "This is admin footer",
            icon: "lock",
            description: "This is admin footer description",
            link: "#",
        },
    ];
    return <AdminFooter supportLink={supportLink} />;
};
