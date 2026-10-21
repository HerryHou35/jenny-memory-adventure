// Prepare through the real UI before exercising older chapter/audio checks.
module.exports=async function prepare(page){
  await page.locator('#prepare-open').click();
  await page.locator('#prepare-download').click();
  await page.waitForFunction(()=>preparedShow.ready&&!preparedShow.busy,null,{timeout:90000});
  await page.locator('#prepare-close').click();
};
