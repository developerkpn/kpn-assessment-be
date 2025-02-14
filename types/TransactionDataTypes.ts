export type BatchRequest = {
    batch_name: string;
    batch_code: string;
    group_id: string;
    bu_id: string;
    function_id: string;
    start_period: Date;
    end_period: Date;
    randomized_question: boolean;
    randomized_test_series: boolean;
    mic: boolean;
    screenshot: boolean;
    note: string;
    template_email_id: string;
}

export type BatchAssesseeRequest = {
    assessee_nik: string;
    assessee_name: string;
    assessee_email: string;
}