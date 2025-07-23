import React from 'react';
import PageMeta from '../components/common/PageMeta';
import PageBreadcrumb from '../components/common/PageBreadCrumb';

const AddModule = () => {
    return (
        <main>
            <PageMeta title="Add Module" />
            <PageBreadcrumb pageTitle="Add Module" />
            <section className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <div className="max-w-2xl mx-auto">
                    {/* ...form and content... */}
                </div>
            </section>
        </main>
    );
};

export default AddModule;
