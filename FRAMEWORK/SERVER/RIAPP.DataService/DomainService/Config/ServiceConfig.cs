﻿using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.DomainService.Config
{
    public class ServiceConfig
    {
        public ServiceConfig()
        {
           DataManagerContainer = new DataManagerContainer();
           ValidatorsContainer = new ValidatorContainer();
        }

        public IValidatorContainer ValidatorsContainer
        {
            get;
        }

        public IDataManagerContainer DataManagerContainer
        {
            get;
        }
    }
}