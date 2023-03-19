'use strict';

if (document.readyState == 'loading'){
	document.addEventListener('DOMContentLoaded', logicOfPage);
} else {
	logicOfPage();
}


function _(selector){
    return document.querySelector(selector);
}


function logicOfPage(){
    goToMain();

    _('.hamburger-menu-icon').onclick = openCloseSideMenu;
    _('.search-icon').onclick = searchFor;
    _('.search').onkeydown = function(e){
        if (e.code !== 'Enter') return;
        searchFor();
    };

    _('.left-side-menu').onclick = getPlacesFrom;
    _('.link-to-main').onclick = goToMain;

    _('.previews').onclick = goToSeeMore;

    forMobileDevises();
}


function openCloseSideMenu(){
    let leftSideMenu = _('.left-side-menu');
    let content = _('.content');
    let hamburgerMenuIcon = _('.hamburger-menu-icon');

    if (leftSideMenu.offsetLeft < 0){
        hamburgerMenuIcon.src = '/static/x.png';
        leftSideMenu.style.left = 0;
        content.style.marginLeft = leftSideMenu.offsetWidth + 20 + 'px';
    } else {
        hamburgerMenuIcon.src = '/static/hamburger-menu.svg';
        leftSideMenu.style.left = -leftSideMenu.offsetWidth + 'px';
        content.style.marginLeft = '20px';
    }
}


function searchFor(){
    let value = _('.search').value;
    if (!value){
        _('.link-to-main').dispatchEvent(new Event('click'));
        return;
    }

    fillPreviews(`?get=search&value=${value}`).then(filled =>{
        _('.content-explanation').style.display = 'block';
        if (filled) _('.content-explanation').textContent = `Search results for "${value}"`;
        else _('.content-explanation').textContent = `No search results for "${value}"`;
    });
}

function fillPreviews(getRequest){
    let locationDetails = _('.location-details');
    if (locationDetails) locationDetails.remove();

    let previews = _('.previews');
    let loading = _('.loading');
    let contentExplanation = _('.content-explanation');
    
    previews.style.display = 'grid';
    previews.replaceChildren();
    contentExplanation.style.display = 'none'
    let loadingTimeout = setTimeout(()=>{
        loading.style.display = 'flex';
    }, 300);

    return ( async ()=>{
        let response = await fetch(getRequest);
        let jsonresponse = await response.json();
        //let jsonresponse =  [{imgSrc: 'image.png', title: 'Beautiful place', location: 'Bukhara'}, 
        //                    {imgSrc: 'image.png', title: 'Beautiful place', location: 'Bukhara'}];

        clearTimeout(loadingTimeout);
        loading.style.display = 'none';

        if (!jsonresponse.length) return false;

        for (let data of jsonresponse){
            let previewComponent = createPreviewComponent(data);
            previews.append(previewComponent);
        }

        _('.search').value = '';
        return true;
    })();
}

function createPreviewComponent(data){
    let preview = document.createElement('div');
    let container = document.createElement('div');
    let previewPicture = document.createElement('img');
    let title = document.createElement('div');
    let region = document.createElement('div');
    let previewButton = document.createElement('button');
    container.append(previewPicture, title, region);
    preview.append(container, previewButton);

    previewPicture.src = data.imgSrc;
    title.textContent = data.title;
    region.textContent = data.location;
    previewButton.innerHTML = 'See more';

    preview.classList.add('preview');
    container.classList.add('preview-inner-container')
    previewPicture.classList.add('preview-picture');
    title.classList.add('title');
    region.classList.add('location');
    previewButton.classList.add('preview-button');

    return preview;
}


function getPlacesFrom(event){
    let target = event.target;
    if (!target.classList.contains('region')) return;

    let region = target.textContent;

    fillPreviews(`?get=region&value=${region}`).then(filled =>{
        _('.content-explanation').style.display = 'block';
        if (filled) _('.content-explanation').textContent = `Places to visit in ${region}`;
        else _('.content-explanation').textContent = `No places to visit in ${region}, yet`;
    });
}


function goToMain(){
    _('.content-explanation').style.display = 'none';
    fillPreviews('?get=main');
}


function goToSeeMore(event){
    let target = event.target;
    if (!target.classList.contains('preview-button')) return;

    let preview = target.closest('.preview');
    let title = preview.querySelector('.title');
    let loading = _('.loading');
    _('.content-explanation').style.display = 'none';
    _('.previews').style.display = 'none';
    let loadingTimeout = setTimeout(()=>{
        loading.style.display = 'flex';
    }, 300);

    ( async()=>{
        let response = await fetch(`?get=seeMore&title=${title.textContent}`);
        let responsejson = await response.json();   console.log(responsejson);

        clearTimeout(loadingTimeout);
        loading.style.display = 'none';
        let locationDeteilsComponent = createLocationDeteilsComponent(responsejson);
        _('.content').append(locationDeteilsComponent);
        
    })();
}

function createLocationDeteilsComponent(data){
    let locationDetails = document.createElement('div');
    let pictures = document.createElement('div');
    let locationInfo = document.createElement('div');
    let locationTitle = document.createElement('div');
    let locationRegion = document.createElement('div');
    let seeLocationButton = document.createElement('button');
    let locationDescription = document.createElement('div');
    locationInfo.append(locationTitle, locationRegion, seeLocationButton, locationDescription);
    locationDetails.append(pictures, locationInfo);

    locationDetails.classList.add('location-details');
    pictures.classList.add('location-pictures');
    locationInfo.classList.add('location-info');
    locationTitle.classList.add('location-title');
    locationRegion.classList.add('location-region');
    seeLocationButton.classList.add('see-location-button');
    locationDescription.classList.add('location-description');

    for (let src of data.pictures){
        let picture = document.createElement('img');
        picture.src = src;
        picture.classList.add('location-picture');
        pictures.append(picture);
    }

    locationTitle.textContent = data.title;
    locationRegion.textContent = data.region;
    seeLocationButton.innerHTML = 'See location';
    seeLocationButton.onclick = () => window.open(data.link);
    seeLocationButton.ontouchstart = function(){
        this.dispatchEvent(new Event('click'));
        return false;
    }
    locationDescription.textContent = data.info;

    return locationDetails;
}


function forMobileDevises(){
    let elems = Array.from(document.querySelectorAll('.region'));
    elems.push(_('.search-icon'), _('.hamburger-menu-icon'), _('.link-to-main'));

    for (let elem of elems){
        elem.ontouchstart = function(){
            this.dispatchEvent(new Event('click', {bubbles: true}));
            return false;
        };
    }
}
