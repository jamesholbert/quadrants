export const perc2color = perc => {
  let r, g, b = 0;
  if(perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  }
  else {
    g = 255;
    r = Math.round(510 - 5.10 * perc);
  }
  let h = r * 0x10000 + g * 0x100 + b * 0x1;
  return '#' + ('000000' + h.toString(16)).slice(-6);
}

export const getSecondsFromDate = (date) => {
  if (date) {
    const date1 = new Date(date);
    const date2 = new Date();
    const Difference_In_Time = date1.getTime() - date2.getTime(); 
      
    // To calculate the no. of days between two dates 
    const  Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    return Difference_In_Days < 1 ? 1 : Difference_In_Days > 10 ? 0 : Difference_In_Days;
  }

  return 0;
}