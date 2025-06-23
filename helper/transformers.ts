export const transformResponseFormat = async (batchInfo: any, reportDesign: any) => {
  if (!batchInfo || !batchInfo.length) {
    return { batch: {}, categories: [] };
  }

  // Extract batch information from the first item
  const firstBatch = batchInfo[0];
  const transformedBatch: any = {
    guide: {
      content: reportDesign.intro[0].content,
    },
    batch: {
      id: firstBatch.id,
      name: firstBatch.batch_name,
      code: firstBatch.batch_code,
      type: firstBatch.type,
    },
    categories: [],
  };

  // Create a map to store categories
  const categoriesMap = new Map();

  // Process each batch item
  batchInfo.forEach((item: any) => {
    const categoryId = item.category_id;

    // If this category doesn't exist in our map yet, create it
    if (!categoriesMap.has(categoryId)) {
      // Find matching intro info from report
      const introInfo = reportDesign.intro.find((intro: any) => intro.category_id === categoryId);

      const category = {
        id: categoryId,
        name: item.category_name,
        code: item.category_code,
        summary_view: introInfo ? introInfo.summary_view.toLowerCase() : "bar",
        summary_type: introInfo ? introInfo.summary_type : "summary",
        summary_formula: introInfo ? introInfo.summary_formula : "sum",
        tests: [],
      };

      categoriesMap.set(categoryId, category);
    }

    // Find test detail info
    const testDetails = reportDesign.detail.find((detail: any) => detail.test_id === item.test_id);

    // Add test to the category
    if (testDetails) {
      const test = {
        id: item.test_id,
        name: item.test_name,
        code: item.test_code,
        summary_view: testDetails.summary_view,
        summary_type: testDetails.summary_type,
        summary_formula: testDetails.summary_formula,
      };

      const category = categoriesMap.get(categoryId);

      // Check if test already exists in the category
      const testExists = category.tests.some((t: any) => t.id === test.id);
      if (!testExists) {
        category.tests.push(test);
      }
    }
  });

  // Convert map to array and calculate testCount
  transformedBatch.categories = Array.from(categoriesMap.values()).map((category) => {
    return {
      ...category,
      testCount: category.tests.length,
    };
  });

  return transformedBatch;
};
